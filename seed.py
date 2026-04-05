"""
Seed MongoDB with demo users and mock certificates (no blockchain calls).

Run from skillchain-backend/:
  python seed.py

Requires MongoDB running and MONGODB_URI in .env (or default localhost).
"""

import asyncio
import os
import sys
from uuid import uuid4

from beanie import init_beanie
from motor.motor_asyncio import AsyncIOMotorClient
from passlib.context import CryptContext

# Ensure `app` package resolves when run as a script
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.models.audit_log import AuditLog  # noqa: E402
from app.models.certificate import Certificate  # noqa: E402
from app.models.user import User  # noqa: E402

_pwd = CryptContext(schemes=["bcrypt"], deprecated="auto")


async def main() -> None:
    from app.core.config import settings

    client = AsyncIOMotorClient(settings.MONGODB_URI)
    db = client.get_default_database()
    await init_beanie(database=db, document_models=[User, Certificate, AuditLog])

    await User.find_all().delete()
    await Certificate.find_all().delete()
    await AuditLog.find_all().delete()

    institute = User(
        name="Demo Institute",
        email="institute@test.com",
        hashed_password=_pwd.hash("test1234"),
        role="institute",
        institution_name="NCVET Demo Institute",
        wallet_address="0x0000000000000000000000000000000000000001",
    )
    await institute.insert()

    learner = User(
        name="Demo Learner",
        email="learner@test.com",
        hashed_password=_pwd.hash("test1234"),
        role="learner",
        wallet_address="0x0000000000000000000000000000000000000002",
    )
    await learner.insert()

    dummy_contract = "0x0000000000000000000000000000000000000000"
    dummy_tx = "0x" + "ab" * 32

    for i in range(2):
        cid = uuid4()
        cert = Certificate(
            certificate_id=cid,
            learner_name=learner.name,
            learner_email=learner.email,
            learner_wallet=learner.wallet_address,
            course_name=f"Mock Course {i + 1}",
            institution_name=institute.institution_name or institute.name,
            completion_date="2025-01-15",
            grade="A",
            ipfs_hash=f"QmMock{i}",
            ipfs_url=f"https://ipfs.io/ipfs/QmMock{i}",
            metadata_ipfs_hash=f"QmMeta{i}",
            metadata_ipfs_url=f"https://ipfs.io/ipfs/QmMeta{i}",
            token_id=1000 + i,
            tx_hash=dummy_tx,
            contract_address=dummy_contract,
            status="ACTIVE",
            issued_by=institute,
        )
        await cert.insert()
        print(f"Certificate {i + 1}: certificate_id={cert.certificate_id} token_id={cert.token_id} tx={dummy_tx}")

    print("--- Seed complete ---")
    print(f"Institute id={institute.id} email={institute.email} password=test1234")
    print(f"Learner id={learner.id} email={learner.email} password=test1234")


if __name__ == "__main__":
    asyncio.run(main())
