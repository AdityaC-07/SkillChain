"""Application settings loaded from environment variables."""

import json
from functools import lru_cache
from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict


def _load_contract_abi() -> list:
    """Load ERC-721 contract ABI from bundled JSON (deploy your contract and update address in .env)."""
    abi_path = Path(__file__).resolve().parent.parent / "contracts" / "abi.json"
    if not abi_path.is_file():
        return []
    with abi_path.open(encoding="utf-8") as f:
        return json.load(f)


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    MONGODB_URI: str = "mongodb://localhost:27017/skillchain"
    JWT_SECRET: str = "change_me_in_production"
    JWT_EXPIRE_MINUTES: int = 1440

    PINATA_API_KEY: str = ""
    PINATA_SECRET_KEY: str = ""
    PINATA_GATEWAY: str = "https://gateway.pinata.cloud/ipfs/"

    POLYGON_RPC_URL: str = "https://rpc-mumbai.maticvigil.com"
    PRIVATE_KEY: str = ""
    CONTRACT_ADDRESS: str = ""

    FRONTEND_URL: str = "http://localhost:5173"

    @property
    def CONTRACT_ABI(self) -> list:
        return _load_contract_abi()


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
