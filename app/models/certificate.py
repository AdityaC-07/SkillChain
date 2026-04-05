"""Certificate document — off-chain record linked to on-chain NFT."""

from datetime import datetime
from typing import Literal
from uuid import UUID, uuid4

from beanie import Document, Link
from pydantic import Field

from app.models.user import User


class Certificate(Document):
    certificate_id: UUID = Field(default_factory=uuid4)
    learner_name: str
    learner_email: str
    learner_wallet: str | None = None
    course_name: str
    institution_name: str
    completion_date: str
    grade: str
    ipfs_hash: str
    ipfs_url: str
    metadata_ipfs_hash: str | None = None
    metadata_ipfs_url: str | None = None
    token_id: int | None = None
    tx_hash: str | None = None
    contract_address: str
    status: Literal["ACTIVE", "REVOKED"] = "ACTIVE"
    issued_by: Link[User]
    issued_at: datetime = Field(default_factory=datetime.utcnow)

    class Settings:
        name = "certificates"
        indexes = ["certificate_id", "learner_email", "token_id"]
