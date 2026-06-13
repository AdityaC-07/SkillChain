from datetime import datetime
from typing import Optional, Literal
from beanie import Document
from pydantic import Field


class DigiLockerSync(Document):
    certificate_id: str
    learner_aadhaar_last4: str
    digilocker_doc_id: Optional[str] = None
    status: Literal["PENDING", "SYNCED", "FAILED"] = "PENDING"
    sandbox_mode: bool = True
    synced_at: Optional[datetime] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)

    class Settings:
        name = "digilocker_sync"
        indexes = ["certificate_id", "digilocker_doc_id"]
