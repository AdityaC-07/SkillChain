"""Issue, verify, list, and revoke vocational certificates."""

from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile, status
from web3 import Web3

from app.core.config import settings
from app.middleware.auth_middleware import get_current_user
from app.middleware.role_guard import require_roles
from app.models.audit_log import AuditLog
from app.models.certificate import Certificate
from app.models.user import User
from app.schemas.certificate_schemas import CertificateDetail, CertificateVerifyResponse, IssueCertificateResponse
from fastapi import BackgroundTasks
from app.services import blockchain_service, ipfs_service, certificate_generator
from app.services.qr_service import generate_qr
from app.utils.sanitization import sanitize_certificate_fields

router = APIRouter(prefix="/api/certificates", tags=["certificates"])

_institute = Depends(require_roles("institute"))
_learner = Depends(require_roles("learner"))
_authed = Depends(get_current_user)


def _owner_match(learner_wallet: str | None, on_chain_owner: str | None) -> bool:
    if not learner_wallet or not on_chain_owner:
        return True
    return on_chain_owner.lower() == learner_wallet.lower()


@router.post("/issue", response_model=IssueCertificateResponse)
async def issue_certificate(
    learner_name: Annotated[str, Form()],
    learner_email: Annotated[str, Form()],
    learner_wallet: Annotated[str, Form(description="Learner Polygon wallet that will receive the NFT")],
    course_name: Annotated[str, Form()],
    completion_date: Annotated[str, Form()],
    grade: Annotated[str, Form()],
    certificate_pdf: Annotated[UploadFile, File()],
    background_tasks: BackgroundTasks,
    user: User = _institute,
):
    # 1) Sanitize input fields
    sanitized_data = sanitize_certificate_fields({
        "learner_name": learner_name,
        "course_name": course_name,
        "institution_name": user.institution_name or user.name,
        "grade": grade,
        "completion_date": completion_date,
    })
    learner_name = sanitized_data["learner_name"]
    course_name = sanitized_data["course_name"]
    institution_name = sanitized_data["institution_name"]
    grade = sanitized_data["grade"]
    completion_date = sanitized_data["completion_date"]

    # 2) Check for duplicate certificate
    existing_cert = await Certificate.find_one(
        Certificate.learner_email == learner_email,
        Certificate.course_name == course_name,
        Certificate.completion_date == completion_date
    )
    if existing_cert:
        raise HTTPException(
            status_code=409,
            detail=f"Certificate already exists for this learner, course, and completion date. Certificate ID: {existing_cert.certificate_id}"
        )

    # 3) Validate uploaded PDF
    from app.utils.file_validation import validate_pdf_upload
    pdf_bytes = await certificate_pdf.read()
    validate_pdf_upload(pdf_bytes, certificate_pdf.filename)

    if not Web3.is_address(learner_wallet):
        raise HTTPException(status_code=400, detail="Invalid learner wallet address")

    institution_name = user.institution_name or user.name

    # create a temporary certificate id to embed in QR/metadata before DB insert
    import uuid
    temp_cid = str(uuid.uuid4())

    # 2) Generate certificate PDF (can incorporate template values)
    cert_doc = {
        "learner_name": learner_name,
        "course_name": course_name,
        "institution_name": institution_name,
        "completion_date": completion_date,
        "grade": grade,
        "certificate_id": temp_cid,
    }

    try:
        generated_pdf = certificate_generator.generate_certificate_pdf(cert_doc)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Certificate generation failed: {e}") from e

    # 3) Generate QR code
    try:
        # Use DB-generated certificate id later; create temp id using UUID4 string
        import uuid

        temp_cid = str(uuid.uuid4())
        qr_png = certificate_generator.generate_qr_code(temp_cid, settings.FRONTEND_URL)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"QR generation failed: {e}") from e

    # 4) Embed QR into PDF
    try:
        final_pdf = certificate_generator.embed_qr_in_certificate(generated_pdf, qr_png)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Embedding QR failed: {e}") from e

    # 5) Upload PDF to IPFS
    try:
        pdf_pin = await ipfs_service.upload_file(final_pdf, certificate_pdf.filename or f"{temp_cid}.pdf", "application/pdf")
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"IPFS upload failed: {e}") from e

    # 6) Build metadata and upload
    try:
        metadata = await ipfs_service.build_certificate_metadata(
            {
                "learner_name": learner_name,
                "course_name": course_name,
                "institution_name": institution_name,
                "completion_date": completion_date,
                "grade": grade,
                "certificate_id": temp_cid,
                "issued_by": institution_name,
                "issued_at_unix": int(__import__("time").time()),
            },
            pdf_ipfs_hash=pdf_pin["ipfs_hash"],
        )
        meta_pin = await ipfs_service.upload_json(metadata, name=f"certificate-{temp_cid}")
    except Exception as e:
        # If metadata fails, try to unpin PDF to avoid orphaned pins
        await ipfs_service.unpin(pdf_pin.get("ipfs_hash"))
        raise HTTPException(status_code=502, detail=f"Metadata IPFS upload failed: {e}") from e

    # 7) Mint on blockchain with graceful failure handling
    token_id = None
    tx_hash = None
    mint_failed = False
    
    try:
        minted = await blockchain_service.mint_certificate(learner_wallet, meta_pin["ipfs_url"])
        token_id = int(minted.get("token_id")) if minted.get("token_id") is not None else None
        tx_hash = minted.get("tx_hash")
    except Exception as e:
        # Log the failure but continue to save certificate as PENDING_MINT
        from logging import getLogger
        logger = getLogger("skillchain.blockchain")
        logger.error(f"Blockchain mint failed for certificate {temp_cid}: {e}")
        mint_failed = True

    # 8) Save Certificate to DB (save even if mint failed as PENDING_MINT)
    try:
        cert = Certificate(
            learner_name=learner_name,
            learner_email=learner_email,
            learner_wallet=learner_wallet,
            course_name=course_name,
            institution_name=institution_name,
            completion_date=completion_date,
            grade=grade,
            ipfs_hash=pdf_pin["ipfs_hash"],
            ipfs_url=pdf_pin["ipfs_url"],
            metadata_ipfs_hash=meta_pin["ipfs_hash"],
            metadata_ipfs_url=meta_pin["ipfs_url"],
            token_id=token_id,
            tx_hash=tx_hash,
            contract_address=Web3.to_checksum_address(settings.CONTRACT_ADDRESS) if settings.CONTRACT_ADDRESS else "",
            status="PENDING_MINT" if mint_failed else "ACTIVE",
            issued_by=user,
        )
        await cert.insert()
    except Exception as e:
        # On DB failure, consider unpinning to avoid orphaned data
        await ipfs_service.unpin(meta_pin.get("ipfs_hash"))
        await ipfs_service.unpin(pdf_pin.get("ipfs_hash"))
        raise HTTPException(status_code=500, detail=f"Saving certificate failed: {e}") from e

    # 9) Audit log
    await AuditLog(
        action="ISSUED",
        certificate_id=str(cert.certificate_id),
        performed_by=str(user.id),
        metadata={"token_id": token_id, "tx_hash": tx_hash},
    ).insert()

    # Background email stub
    def _send_email_stub(to_email: str, certificate_id: str):
        # In production integrate SMTP/SES; for now just log
        from logging import getLogger

        logger = getLogger("skillchain.email")
        logger.info("Pretend-sent certificate email to %s for %s", to_email, certificate_id)

    # schedule background email
    background_tasks.add_task(_send_email_stub, learner_email, str(cert.certificate_id))

    qr_b64 = generate_qr(str(cert.certificate_id))

    return IssueCertificateResponse(
        certificate_id=cert.certificate_id,
        token_id=token_id,
        tx_hash=tx_hash,
        qr_code_base64=qr_b64,
    )


@router.get("/verify/{certificate_id}", response_model=CertificateVerifyResponse)
async def verify_certificate_public(certificate_id: UUID):
    cert = await Certificate.find_one(Certificate.certificate_id == certificate_id)
    if cert is None:
        raise HTTPException(status_code=404, detail="Certificate not found")

    chain = {"token_uri": None, "owner": None}
    if cert.token_id is not None:
        try:
            chain = await blockchain_service.verify_certificate(cert.token_id)
        except ValueError:
            pass
        except Exception:
            chain = {"token_uri": None, "owner": None}

    on_chain_owner = chain.get("owner")
    if hasattr(on_chain_owner, "lower"):
        on_chain_owner = str(on_chain_owner)

    token_uri = chain.get("token_uri")
    valid_on_chain = token_uri is not None and on_chain_owner is not None
    owner_ok = _owner_match(cert.learner_wallet, on_chain_owner)
    blockchain_status = "VALID" if valid_on_chain and owner_ok else "INVALID"

    await AuditLog(
        action="VERIFIED",
        certificate_id=str(cert.certificate_id),
        performed_by=None,
        metadata={
            "blockchain_status": blockchain_status,
            "public_verify": True,
        },
    ).insert()

    cert_dict = {
        "certificate_id": str(cert.certificate_id),
        "learner_name": cert.learner_name,
        "course_name": cert.course_name,
        "institution_name": cert.institution_name,
        "completion_date": cert.completion_date,
        "grade": cert.grade,
        "status": cert.status,
        "issued_at": cert.issued_at.isoformat(),
    }

    return CertificateVerifyResponse(
        certificate_data=cert_dict,
        blockchain_status=blockchain_status,
        on_chain_owner=on_chain_owner,
        ipfs_url=cert.ipfs_url,
        tx_hash=cert.tx_hash,
    )


@router.get("/my", response_model=list[CertificateDetail])
async def my_certificates(user: User = _learner):
    certs = await Certificate.find(Certificate.learner_email == user.email).to_list()
    return [_cert_detail(c) for c in certs]


def _cert_detail(c: Certificate) -> CertificateDetail:
    return CertificateDetail(
        certificate_id=c.certificate_id,
        learner_name=c.learner_name,
        learner_email=c.learner_email,
        learner_wallet=c.learner_wallet,
        course_name=c.course_name,
        institution_name=c.institution_name,
        completion_date=c.completion_date,
        grade=c.grade,
        ipfs_hash=c.ipfs_hash,
        ipfs_url=c.ipfs_url,
        metadata_ipfs_url=c.metadata_ipfs_url,
        token_id=c.token_id,
        tx_hash=c.tx_hash,
        contract_address=c.contract_address,
        status=c.status,
        issued_at=c.issued_at,
    )


async def _can_view_certificate(user: User, cert: Certificate) -> bool:
    if user.role == "verifier":
        return True
    if user.role == "learner" and cert.learner_email == user.email:
        return True
    if user.role == "institute":
        await cert.fetch_link(Certificate.issued_by)
        issuer = cert.issued_by
        if issuer and str(issuer.id) == str(user.id):
            return True
    return False


@router.get("/{certificate_id}", response_model=CertificateDetail)
async def get_certificate(certificate_id: UUID, user: User = _authed):
    cert = await Certificate.find_one(Certificate.certificate_id == certificate_id)
    if cert is None:
        raise HTTPException(status_code=404, detail="Certificate not found")
    if not await _can_view_certificate(user, cert):
        raise HTTPException(status_code=403, detail="Not allowed to view this certificate")
    return _cert_detail(cert)


@router.post("/revoke/{certificate_id}")
async def revoke_certificate(certificate_id: UUID, user: User = _institute):
    cert = await Certificate.find_one(Certificate.certificate_id == certificate_id)
    if cert is None:
        raise HTTPException(status_code=404, detail="Certificate not found")

    await cert.fetch_link(Certificate.issued_by)
    issuer = cert.issued_by
    if issuer is None or str(issuer.id) != str(user.id):
        raise HTTPException(status_code=403, detail="Only the issuing institute can revoke")

    if cert.status == "REVOKED":
        raise HTTPException(status_code=400, detail="Certificate already revoked")

    if cert.token_id is not None:
        try:
            tx = await blockchain_service.revoke_certificate(cert.token_id)
        except Exception as e:
            raise HTTPException(status_code=502, detail=f"Blockchain revoke failed: {e}") from e
    else:
        tx = None

    cert.status = "REVOKED"
    await cert.save()

    await AuditLog(
        action="REVOKED",
        certificate_id=str(cert.certificate_id),
        performed_by=str(user.id),
        metadata={"tx_hash": tx},
    ).insert()

    return {"status": "REVOKED", "certificate_id": str(cert.certificate_id), "tx_hash": tx}


@router.get("/pending")
async def get_pending_certificates(user: User = _institute):
    """Get all certificates in PENDING_MINT status for the current institute."""
    pending_certs = await Certificate.find(
        Certificate.status == "PENDING_MINT",
        Certificate.issued_by == user
    ).to_list()
    
    return [
        {
            "certificate_id": str(cert.certificate_id),
            "learner_name": cert.learner_name,
            "learner_email": cert.learner_email,
            "course_name": cert.course_name,
            "completion_date": cert.completion_date,
            "grade": cert.grade,
            "retry_count": cert.retry_count,
            "issued_at": cert.issued_at.isoformat(),
        }
        for cert in pending_certs
    ]
