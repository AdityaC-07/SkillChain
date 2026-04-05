"""Audit trail for issuance, verification, revocation, and fraud scans."""

from datetime import datetime
from typing import Any, Literal

from beanie import Document
from pydantic import Field


class AuditLog(Document):
    action: Literal["ISSUED", "VERIFIED", "REVOKED", "FRAUD_SCAN"]
    certificate_id: str | None = None
    performed_by: str | None = None
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    metadata: dict[str, Any] = Field(default_factory=dict)

    class Settings:
        name = "audit_logs"
        indexes = ["action", "timestamp", "certificate_id"]
