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
