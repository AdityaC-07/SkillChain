from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel

from app.middleware.auth_middleware import get_current_user
from app.models.certificate import Certificate
from app.services.digilocker_service import digilocker_service
from app.models.digilocker_sync import DigiLockerSync

router = APIRouter(prefix="/api/digilocker", tags=["digilocker"])


class PushBody(BaseModel):
    aadhaar_last4: str


@router.post("/push/{certificate_id}")
async def push_certificate(certificate_id: str, body: PushBody, user=Depends(get_current_user)):
    # Load certificate
    cert = await Certificate.find_one(Certificate.certificate_id == certificate_id)
    if not cert:
        raise HTTPException(status_code=404, detail="Certificate not found")

    # Only learner owner may push
    if not (user.email == cert.learner_email or (user.wallet_address and user.wallet_address.lower() == (cert.learner_wallet or '').lower())):
        raise HTTPException(status_code=403, detail="Only the certificate owner may push to DigiLocker")

    # Build payload for DigiLocker (minimal fields for sandbox)
    payload = {
        "doctype": "CERTF",
        "orgid": "SKILLCHAIN",
        "docname": "Vocational Training Certificate",
        "issuedto": body.aadhaar_last4,
        "issuedby": cert.institution_name,
        "validfrom": cert.completion_date,
        "uri": cert.ipfs_url,
        "docid": str(cert.certificate_id),
    }

    result = await digilocker_service.push_certificate(str(certificate_id), body.aadhaar_last4, payload)
    return {"success": True, "data": result}


@router.get("/status/{certificate_id}")
async def status(certificate_id: str):
    st = await digilocker_service.get_sync_status(str(certificate_id))
    return {"success": True, "data": st}


@router.get("/share-url/{certificate_id}")
async def share_url(certificate_id: str, user=Depends(get_current_user)):
    # Ensure caller owns cert
    cert = await Certificate.find_one(Certificate.certificate_id == certificate_id)
    if not cert:
        raise HTTPException(status_code=404, detail="Certificate not found")
    if not (user.email == cert.learner_email or (user.wallet_address and user.wallet_address.lower() == (cert.learner_wallet or '').lower())):
        raise HTTPException(status_code=403, detail="Only the certificate owner may generate share links")

    url = await digilocker_service.generate_share_url(str(certificate_id))
    return {"success": True, "url": url}
"""Mock DigiLocker integration — replace with real API credentials in production."""

from uuid import UUID, uuid4

from fastapi import APIRouter, HTTPException

from app.models.certificate import Certificate

router = APIRouter(prefix="/api/digilocker", tags=["digilocker"])


@router.post("/push/{certificate_id}")
async def push_to_digilocker(certificate_id: str):
    """
    Simulate pushing a certificate to DigiLocker.
    Logs intent only; production would exchange OAuth tokens and call issuer APIs.
    """
    try:
        cid = UUID(certificate_id)
    except ValueError as e:
        raise HTTPException(status_code=400, detail="Invalid certificate_id") from e

    cert = await Certificate.find_one(Certificate.certificate_id == cid)
    if cert is None:
        raise HTTPException(status_code=404, detail="Certificate not found")

    ref = str(uuid4())
    # In production: POST to DigiLocker push endpoint with signed payload + doc URI.
    return {"status": "PUSHED", "digilocker_ref_id": ref, "certificate_id": certificate_id}


@router.get("/status/{certificate_id}")
async def digilocker_status(certificate_id: str):
    """Mock sync status for UI demos."""
    try:
        UUID(certificate_id)
    except ValueError as e:
        raise HTTPException(status_code=400, detail="Invalid certificate_id") from e

    return {
        "certificate_id": certificate_id,
        "sync_status": "SYNCED_MOCK",
        "message": "Mock status — DigiLocker API not configured",
    }
