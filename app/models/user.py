"""User document — institutes, learners, and verifiers."""

from datetime import datetime
from typing import Literal

from beanie import Document
from pydantic import EmailStr, Field


class User(Document):
    name: str
    email: EmailStr
    hashed_password: str
    role: Literal["institute", "learner", "verifier"]
    wallet_address: str | None = None
    institution_name: str | None = None
    created_at: datetime = Field(default_factory=datetime.utcnow)

    class Settings:
        name = "users"
        indexes = ["email"]
