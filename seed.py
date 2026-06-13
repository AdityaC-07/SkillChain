"""Seed script to populate development data for SkillChain.

Run: python seed.py
"""
import asyncio
import secrets
from datetime import datetime

from colorama import Fore, Style
from eth_account import Account

from app.core.database import init_db
from app.models.user import User
from app.models.certificate import Certificate
from app.models.fraud_alert import FraudAlert
from app.models.digilocker_sync import DigiLockerSync


async def create_wallet():
    acct = Account.create()
    return acct.address, acct.key.hex()


async def run():
    await init_db()

    # Create institute
    institute_email = "institute@skillchain.test"
    institute_pw = "SkillChain@2025"
    inst_wallet, inst_pk = await create_wallet()
    inst = User(name="National Institute of Technology Skills", email=institute_email, hashed_password=institute_pw, role="institute", wallet_address=inst_wallet, institution_name="National Institute of Technology Skills")
    await inst.insert()

    # Create learner
    learner_email = "ravi.kumar@test.com"
    learner_pw = "Learner@2025"
    learner_wallet, learner_pk = await create_wallet()
    learner = User(name="Ravi Kumar", email=learner_email, hashed_password=learner_pw, role="learner", wallet_address=learner_wallet)
    await learner.insert()

    # Create certificates
    courses = [
        ("Welding NSQF L4", "A"),
        ("Electrical Wiring L3", "B"),
        ("Computer Basics L2", "A"),
        ("Plumbing L3", "C"),
        ("Solar Panel Installation L4", "A"),
    ]

    certs = []
    for i, (course, grade) in enumerate(courses):
        cert = Certificate(
            learner_name=learner.name,
            learner_email=learner.email,
            learner_wallet=learner.wallet_address,
            course_name=course,
            institution_name=inst.institution_name,
            completion_date=datetime.utcnow().date().isoformat(),
            grade=grade,
            ipfs_hash=f"Qm{secrets.token_hex(8)}",
            ipfs_url=f"https://ipfs.example/{secrets.token_hex(8)}",
            metadata_ipfs_hash=None,
            metadata_ipfs_url=None,
            token_id=1000 + i,
            tx_hash=f"0x{secrets.token_hex(32)}",
            contract_address="0xDEADBEEF",
            issued_by=inst,
        )
        await cert.insert()
        certs.append(cert)

    # Create fraud scans
    alerts = [
        ("scan-1", "GENUINE", 0.05),
        ("scan-2", "SUSPICIOUS", 0.55),
        ("scan-3", "FAKE", 0.92),
    ]
    for sid, verdict, score in alerts:
        a = FraudAlert(scan_id=sid, verdict=verdict, fraud_score=score, confidence=0.9, signals={"example": True}, scanned_by=None, certificate_id=str(certs[0].certificate_id))
        await a.insert()

    # DigiLocker sync for first certificate
    dl = DigiLockerSync(certificate_id=str(certs[0].certificate_id), learner_aadhaar_last4="1234", digilocker_doc_id=f"DL-{secrets.token_hex(4)}", status="SYNCED", sandbox_mode=True)
    await dl.insert()

    # Print summary
    print(Fore.GREEN + "✅ Created: 1 institute, 1 learner, 5 certificates, 3 fraud scans" + Style.RESET_ALL)
    print(Fore.YELLOW + "🔑 Login: {} / {}".format(institute_email, institute_pw) + Style.RESET_ALL)
    print(Fore.CYAN + "Learner: {} / {}".format(learner_email, learner_pw) + Style.RESET_ALL)
    print(Fore.MAGENTA + "🔍 Verify test cert: GET /api/certificates/verify/{}".format(certs[0].certificate_id) + Style.RESET_ALL)
    print(Fore.BLUE + "🌐 API Docs: http://localhost:8000/docs" + Style.RESET_ALL)


if __name__ == "__main__":
    asyncio.run(run())
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
