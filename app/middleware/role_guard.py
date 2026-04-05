"""Role-based access dependencies."""

from typing import Annotated, Literal

from fastapi import Depends, HTTPException, status

from app.middleware.auth_middleware import get_current_user
from app.models.user import User

Role = Literal["institute", "learner", "verifier"]


def require_roles(*allowed: Role):
    """Factory: FastAPI Depends() that ensures current user has one of the allowed roles."""

    async def _guard(user: Annotated[User, Depends(get_current_user)]) -> User:
        if user.role not in allowed:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Insufficient permissions for this action",
            )
        return user

    return _guard
