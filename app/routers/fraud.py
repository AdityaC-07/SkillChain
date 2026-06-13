"""Routes for fraud scanning and alerting."""
from datetime import datetime, timedelta
import hashlib
from typing import List

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, Request

from app.middleware.auth_middleware import get_current_user
from app.middleware.role_guard import require_roles
from app.models.audit_log import AuditLog
from app.models.fraud_alert import FraudAlert
from app.models.user import User
from app.services.fraud_service import fraud_detection_service

router = APIRouter(prefix="/api/fraud", tags=["fraud"])


ALLOWED_MIME = ("image/jpeg", "image/png", "image/webp")
MAX_BYTES = 10 * 1024 * 1024


@router.post("/scan")
async def scan_certificate(request: Request, image: UploadFile = File(...), user: User = Depends(get_current_user)):
    # Validate size
    contents = await image.read()
    if not contents:
        raise HTTPException(status_code=400, detail="Empty file")
    if len(contents) > MAX_BYTES:
        raise HTTPException(status_code=413, detail="File too large (max 10MB)")

    # Validate MIME via magic bytes if available
    mime = None
    try:
        import magic

        mime = magic.from_buffer(contents, mime=True)
    except Exception:
        # fallback to provided content_type
        mime = image.content_type

    if mime not in ALLOWED_MIME:
        raise HTTPException(status_code=400, detail=f"Unsupported image type: {mime}")

    # Resize to max 1024 px longest side for faster analysis
    from PIL import Image

    try:
        img = Image.open(__import__("io").BytesIO(contents)).convert("RGB")
    except Exception:
        raise HTTPException(status_code=400, detail="Unable to parse image")

    max_side = max(img.size)
    if max_side > 1024:
        scale = 1024 / max_side
        new_size = (int(img.width * scale), int(img.height * scale))
        img = img.resize(new_size)

    buf = __import__("io").BytesIO()
    img.save(buf, format="PNG")
    buf.seek(0)
    processed_bytes = buf.getvalue()

    # Compute sha256 for dedup / provenance
    image_hash = hashlib.sha256(processed_bytes).hexdigest()

    # Analyze
    analysis = await fraud_detection_service.analyze_certificate(processed_bytes)

    # Record audit log
    await AuditLog(
        action="FRAUD_SCAN",
        certificate_id=None,
        performed_by=str(user.id) if user else None,
        metadata={
            "verdict": analysis.get("verdict"),
            "fraud_score": analysis.get("fraud_score"),
            "signals": analysis.get("signals"),
        },
    ).insert()

    # If FAKE, create FraudAlert
    if analysis.get("verdict") == "FAKE":
        alert = FraudAlert(
            scan_id=str(__import__("uuid").uuid4()),
            verdict=analysis.get("verdict"),
            fraud_score=analysis.get("fraud_score"),
            confidence=analysis.get("confidence"),
            signals=analysis.get("signals"),
            scanned_by=user,
            certificate_id=None,
            ip_address=request.client.host if request.client else None,
            image_hash=image_hash,
        )
        await alert.insert()

    return {"analysis": analysis, "image_hash": image_hash}


@router.get("/alerts", response_model=List[dict])
async def list_alerts(user: User = Depends(require_roles("institute"))):
    # Return FAKE verdicts from last 30 days
    cutoff = datetime.utcnow() - timedelta(days=30)
    alerts = await FraudAlert.find(FraudAlert.verdict == "FAKE", FraudAlert.created_at >= cutoff).to_list()
    out = []
    for a in alerts:
        out.append(
            {
                "scan_id": a.scan_id,
                "fraud_score": a.fraud_score,
                "created_at": a.created_at.isoformat(),
                "scanned_by": str(a.scanned_by.id) if a.scanned_by else None,
                "certificate_id": a.certificate_id,
                "image_hash": a.image_hash,
            }
        )
    return out


@router.get("/stats")
async def stats(user: User = Depends(get_current_user)):
    # Basic counts and averages
    total_scans = await AuditLog.find(AuditLog.action == "FRAUD_SCAN").count()
    scans = await AuditLog.find(AuditLog.action == "FRAUD_SCAN").to_list()
    genuine = suspicious = fake = 0
    total_time = 0
    scans_today = 0
    today = datetime.utcnow().date()
    for s in scans:
        meta = s.metadata or {}
        score = float(meta.get("fraud_score", 0))
        if score < 0.30:
            genuine += 1
        elif score < 0.65:
            suspicious += 1
        else:
            fake += 1
        total_time += int(meta.get("processing_time_ms", 0))
        if s.timestamp.date() == today:
            scans_today += 1

    avg_time = int(total_time / max(1, total_scans)) if total_scans else 0

    return {
        "total_scans": total_scans,
        "genuine_count": genuine,
        "suspicious_count": suspicious,
        "fake_count": fake,
        "avg_processing_time_ms": avg_time,
        "scans_today": scans_today,
    }
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
