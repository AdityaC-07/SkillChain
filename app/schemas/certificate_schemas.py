"""Certificate-related API schemas."""

from datetime import datetime
from typing import Any, Literal
from uuid import UUID

from pydantic import BaseModel, EmailStr


class CertificateVerifyResponse(BaseModel):
    certificate_data: dict[str, Any]
    blockchain_status: Literal["VALID", "INVALID"]
    on_chain_owner: str | None = None
    ipfs_url: str | None = None
    tx_hash: str | None = None


class IssueCertificateResponse(BaseModel):
    certificate_id: UUID
    token_id: int | None
    tx_hash: str | None
    qr_code_base64: str


class CertificateDetail(BaseModel):
    certificate_id: UUID
    learner_name: str
    learner_email: EmailStr
    learner_wallet: str | None
    course_name: str
    institution_name: str
    completion_date: str
    grade: str
    ipfs_hash: str
    ipfs_url: str
    metadata_ipfs_url: str | None
    token_id: int | None
    tx_hash: str | None
    contract_address: str
    status: Literal["ACTIVE", "REVOKED"]
    issued_at: datetime

    class Config:
        from_attributes = True
