"""Request/response models for authentication."""

from datetime import datetime
from typing import Literal

from pydantic import BaseModel, EmailStr, Field


class RegisterBody(BaseModel):
    name: str
    email: EmailStr
    password: str = Field(min_length=6)
    role: Literal["institute", "learner", "verifier"]
    institution_name: str | None = None


class LoginBody(BaseModel):
    email: EmailStr
    password: str


class UserPublic(BaseModel):
    id: str
    name: str
    email: EmailStr
    role: Literal["institute", "learner", "verifier"]
    wallet_address: str | None = None
    institution_name: str | None = None
    created_at: datetime

    class Config:
        from_attributes = True


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserPublic


class MeResponse(BaseModel):
    user: UserPublic
