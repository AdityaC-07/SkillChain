"""JWT creation and validation helpers."""

from datetime import datetime, timedelta, timezone
from typing import Any

from jose import JWTError, jwt

from app.core.config import settings


def create_access_token(subject: str, extra_claims: dict[str, Any] | None = None) -> str:
    """Build a signed JWT with sub (user id) and optional extra claims."""
    expire = datetime.now(timezone.utc) + timedelta(minutes=settings.JWT_EXPIRE_MINUTES)
    payload: dict[str, Any] = {"sub": subject, "exp": expire}
    if extra_claims:
        payload.update(extra_claims)
    return jwt.encode(payload, settings.JWT_SECRET, algorithm="HS256")


def decode_token(token: str) -> dict[str, Any]:
    """Decode and validate JWT; raises jose.JWTError on failure."""
    return jwt.decode(token, settings.JWT_SECRET, algorithms=["HS256"])
