from datetime import datetime, timedelta, timezone
from typing import Dict
from jose import jwt

from app.core.config import settings
from app.models.digilocker_sync import DigiLockerSync
from app.core.database import get_client


class DigiLockerService:
    SANDBOX_URL = "https://digilocker.meripehchaan.gov.in"

    async def push_certificate(self, certificate_id: str, learner_aadhaar_last4: str, payload: Dict) -> Dict:
        """
        In sandbox mode simulate pushing document to DigiLocker and record sync state.
        """
        # Simulate a remote doc id and record
        doc_id = f"DL-{certificate_id[:8]}"
        rec = DigiLockerSync(
            certificate_id=certificate_id,
            learner_aadhaar_last4=learner_aadhaar_last4,
            digilocker_doc_id=doc_id,
            status="SYNCED",
            sandbox_mode=True,
            synced_at=datetime.now(timezone.utc),
        )
        await rec.insert()
        return {
            "status": "SYNCED",
            "digilocker_doc_id": doc_id,
            "sync_timestamp": rec.synced_at.isoformat(),
            "sandbox_mode": True,
        }

    async def get_sync_status(self, certificate_id: str) -> Dict:
        rec = await DigiLockerSync.find_one(DigiLockerSync.certificate_id == certificate_id)
        if rec is None:
            return {"status": "PENDING"}
        return {
            "status": rec.status,
            "digilocker_doc_id": rec.digilocker_doc_id,
            "synced_at": rec.synced_at.isoformat() if rec.synced_at else None,
            "sandbox_mode": rec.sandbox_mode,
        }

    async def generate_share_url(self, certificate_id: str) -> str:
        # Generate JWT expiring in 7 days
        exp = datetime.now(timezone.utc) + timedelta(days=7)
        payload = {"cert_id": str(certificate_id), "exp": int(exp.timestamp())}
        token = jwt.encode(payload, settings.JWT_SECRET, algorithm="HS256")
        return f"{settings.FRONTEND_URL}/verify/{certificate_id}?token={token}"


digilocker_service = DigiLockerService()
