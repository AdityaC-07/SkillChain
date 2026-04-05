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
from app.services import blockchain_service, ipfs_service, qr_service

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
    user: User = _institute,
):
    pdf_bytes = await certificate_pdf.read()
    if not pdf_bytes:
        raise HTTPException(status_code=400, detail="certificate_pdf is empty")

    try:
        pdf_pin = await ipfs_service.upload_file_to_ipfs(pdf_bytes, certificate_pdf.filename or "cert.pdf")
    except ValueError as e:
        raise HTTPException(status_code=503, detail=str(e)) from e
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"IPFS upload failed: {e}") from e

    institution_name = user.institution_name or user.name
    metadata = {
        "name": f"{course_name} — {learner_name}",
        "description": f"SkillChain certificate for {course_name} completed at {institution_name}",
        "image": pdf_pin["ipfs_url"],
        "attributes": [
            {"trait_type": "Course", "value": course_name},
            {"trait_type": "Institution", "value": institution_name},
            {"trait_type": "Completion Date", "value": completion_date},
            {"trait_type": "Grade", "value": grade},
            {"trait_type": "Learner Email", "value": learner_email},
        ],
    }

    try:
        meta_pin = await ipfs_service.upload_json_to_ipfs(metadata)
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Metadata IPFS upload failed: {e}") from e

    token_id: int | None = None
    tx_hash: str | None = None
    try:
        minted = await blockchain_service.mint_certificate(learner_wallet, meta_pin["ipfs_url"])
        token_id = int(minted["token_id"])
        tx_hash = minted["tx_hash"]
    except ValueError as e:
        raise HTTPException(status_code=503, detail=str(e)) from e
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Blockchain mint failed: {e}") from e

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
        contract_address=Web3.to_checksum_address(settings.CONTRACT_ADDRESS)
        if settings.CONTRACT_ADDRESS
        else "",
        status="ACTIVE",
        issued_by=user,
    )
    await cert.insert()

    await AuditLog(
        action="ISSUED",
        certificate_id=str(cert.certificate_id),
        performed_by=str(user.id),
        metadata={"token_id": token_id, "tx_hash": tx_hash},
    ).insert()

    qr_b64 = qr_service.generate_qr(str(cert.certificate_id))
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
