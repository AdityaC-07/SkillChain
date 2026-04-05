"""MongoDB connection and Beanie ODM initialization."""

from beanie import init_beanie
from motor.motor_asyncio import AsyncIOMotorClient

from app.core.config import settings
from app.models.audit_log import AuditLog
from app.models.certificate import Certificate
from app.models.user import User

_client: AsyncIOMotorClient | None = None


async def init_db() -> None:
    """Connect to MongoDB and register Beanie document models."""
    global _client
    _client = AsyncIOMotorClient(settings.MONGODB_URI)
    db = _client.get_default_database()
    await init_beanie(
        database=db,
        document_models=[User, Certificate, AuditLog],
    )


def get_client() -> AsyncIOMotorClient:
    if _client is None:
        raise RuntimeError("Database not initialized; call init_db() during app startup.")
    return _client
