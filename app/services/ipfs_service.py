"""Upload files and JSON metadata to IPFS using Pinata's pinning API."""

import asyncio
from typing import Any

import requests

from app.core.config import settings


def _headers() -> dict[str, str]:
    return {
        "pinata_api_key": settings.PINATA_API_KEY,
        "pinata_secret_api_key": settings.PINATA_SECRET_KEY,
    }


async def upload_file_to_ipfs(file_bytes: bytes, filename: str) -> dict[str, str]:
    """
    Pin a binary file (e.g. certificate PDF) to IPFS via Pinata.
    Returns gateway URL and CID hash.
    """
    if not settings.PINATA_API_KEY or not settings.PINATA_SECRET_KEY:
        raise ValueError("Pinata API credentials are not configured in .env")

    def _post() -> dict[str, Any]:
        files = {"file": (filename, file_bytes)}
        r = requests.post(
            "https://api.pinata.cloud/pinning/pinFileToIPFS",
            files=files,
            headers=_headers(),
            timeout=120,
        )
        r.raise_for_status()
        return r.json()

    data = await asyncio.to_thread(_post)
    ipfs_hash = data["IpfsHash"]
    ipfs_url = f"{settings.PINATA_GATEWAY.rstrip('/')}/{ipfs_hash}"
    return {"ipfs_hash": ipfs_hash, "ipfs_url": ipfs_url}


async def upload_json_to_ipfs(metadata: dict) -> dict[str, str]:
    """Pin a JSON object (NFT metadata) to IPFS via Pinata."""
    if not settings.PINATA_API_KEY or not settings.PINATA_SECRET_KEY:
        raise ValueError("Pinata API credentials are not configured in .env")

    def _post() -> dict[str, Any]:
        body = {"pinataContent": metadata, "pinataMetadata": {"name": "skillchain-metadata"}}
        r = requests.post(
            "https://api.pinata.cloud/pinning/pinJSONToIPFS",
            json=body,
            headers={**_headers(), "Content-Type": "application/json"},
            timeout=120,
        )
        r.raise_for_status()
        return r.json()

    data = await asyncio.to_thread(_post)
    ipfs_hash = data["IpfsHash"]
    ipfs_url = f"{settings.PINATA_GATEWAY.rstrip('/')}/{ipfs_hash}"
    return {"ipfs_hash": ipfs_hash, "ipfs_url": ipfs_url}
