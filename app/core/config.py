"""Application settings loaded from environment variables."""

import json
import logging
from functools import lru_cache
from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict

logger = logging.getLogger(__name__)


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
    ALLOWED_ORIGINS: str = "http://localhost:5173"

    @property
    def CONTRACT_ABI(self) -> list:
        return _load_contract_abi()


@lru_cache
def get_settings() -> Settings:
    return Settings()


def validate_environment(settings: Settings) -> bool:
    """Validate required environment variables on startup.
    
    Returns:
        bool: True if running in read-only mode (issuance disabled), False otherwise
    """
    required_vars = {
        "MONGODB_URI": settings.MONGODB_URI,
        "JWT_SECRET": settings.JWT_SECRET,
        "PINATA_API_KEY": settings.PINATA_API_KEY,
        "PINATA_SECRET_KEY": settings.PINATA_SECRET_KEY,
        "POLYGON_RPC_URL": settings.POLYGON_RPC_URL,
    }
    
    missing_vars = [var for var, value in required_vars.items() if not value]
    
    if missing_vars:
        raise ValueError(f"Missing required environment variables: {', '.join(missing_vars)}")
    
    # CONTRACT_ADDRESS can be empty before deploy
    # PRIVATE_KEY is optional for read-only mode
    read_only_mode = False
    if not settings.PRIVATE_KEY:
        logger.warning("PRIVATE_KEY not set - server starting in READ-ONLY mode (certificate issuance disabled)")
        read_only_mode = True
    
    return read_only_mode


settings = get_settings()
