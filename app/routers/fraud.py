"""Image-based fraud screening (demo classifier wired for hackathon flows)."""

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile

from app.middleware.auth_middleware import get_current_user
from app.models.audit_log import AuditLog
from app.models.user import User
from app.schemas.fraud_schemas import FraudScanResponse
from app.services import fraud_service

router = APIRouter(prefix="/api/fraud", tags=["fraud"])


@router.post("/scan", response_model=FraudScanResponse)
async def scan(
    file: UploadFile = File(...),
    user: User = Depends(get_current_user),
):
    data = await file.read()
    if not data:
        raise HTTPException(status_code=400, detail="Empty file")

    try:
        result = await fraud_service.analyze_image(data)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Fraud analysis failed: {e}") from e

    await AuditLog(
        action="FRAUD_SCAN",
        certificate_id=None,
        performed_by=str(user.id),
        metadata={
            "verdict": result["verdict"],
            "fraud_score": result["fraud_score"],
            "filename": file.filename,
        },
    ).insert()

    return FraudScanResponse(**result)
