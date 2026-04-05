"""Registration, login, and current user profile."""

from fastapi import APIRouter, Depends, HTTPException, status
from passlib.context import CryptContext

from app.middleware.auth_middleware import get_current_user
from app.models.user import User
from app.schemas.auth_schemas import LoginBody, MeResponse, RegisterBody, TokenResponse, UserPublic
from app.utils.jwt_utils import create_access_token

router = APIRouter(prefix="/api/auth", tags=["auth"])

_pwd = CryptContext(schemes=["bcrypt"], deprecated="auto")


def _hash_password(password: str) -> str:
    return _pwd.hash(password)


def _verify_password(plain: str, hashed: str) -> bool:
    return _pwd.verify(plain, hashed)


def _to_public(user: User) -> UserPublic:
    return UserPublic(
        id=str(user.id),
        name=user.name,
        email=user.email,
        role=user.role,
        wallet_address=user.wallet_address,
        institution_name=user.institution_name,
        created_at=user.created_at,
    )


@router.post("/register", response_model=TokenResponse)
async def register(body: RegisterBody):
    existing = await User.find_one(User.email == body.email)
    if existing:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email already registered")

    if body.role == "institute" and not body.institution_name:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="institution_name is required for institute accounts",
        )

    user = User(
        name=body.name,
        email=body.email,
        hashed_password=_hash_password(body.password),
        role=body.role,
        institution_name=body.institution_name,
    )
    await user.insert()

    token = create_access_token(str(user.id), {"role": user.role})
    return TokenResponse(access_token=token, user=_to_public(user))


@router.post("/login", response_model=TokenResponse)
async def login(body: LoginBody):
    user = await User.find_one(User.email == body.email)
    if user is None or not _verify_password(body.password, user.hashed_password):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")

    token = create_access_token(str(user.id), {"role": user.role})
    return TokenResponse(access_token=token, user=_to_public(user))


@router.get("/me", response_model=MeResponse)
async def me(user: User = Depends(get_current_user)):
    return MeResponse(user=_to_public(user))
