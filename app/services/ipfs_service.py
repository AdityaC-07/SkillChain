"""Async IPFS helper using Pinata API (pinning service).

This service uploads files and JSON to Pinata using aiohttp and returns
IPFS hashes/URLs suitable for NFT metadata.
"""
from __future__ import annotations

import asyncio
import io
import json
from typing import Dict

import aiohttp

from app.core.config import settings


class IPFSService:
    BASE_URL = "https://api.pinata.cloud"
    GATEWAY = "https://gateway.pinata.cloud/ipfs/"

    def __init__(self):
        if not settings.PINATA_API_KEY or not settings.PINATA_SECRET_KEY:
            # Service will raise on requests but allow import without env set.
            self.auth = None
        else:
            self.auth = (settings.PINATA_API_KEY, settings.PINATA_SECRET_KEY)

    async def _request(self, method: str, path: str, **kwargs):
        url = f"{self.BASE_URL}{path}"
        headers = kwargs.pop("headers", {}) or {}
        if self.auth:
            headers.update({"pinata_api_key": self.auth[0], "pinata_secret_api_key": self.auth[1]})

        timeout = aiohttp.ClientTimeout(total=60)
        async with aiohttp.ClientSession(timeout=timeout) as session:
            async with session.request(method, url, headers=headers, **kwargs) as resp:
                text = await resp.text()
                if resp.status >= 400:
                    raise RuntimeError(f"Pinata API error {resp.status}: {text}")
                try:
                    return await resp.json()
                except Exception:
                    return text

    async def upload_file(self, file_bytes: bytes, filename: str, mime_type: str) -> Dict[str, any]:
        """Upload a file to Pinata (pinFileToIPFS). Retries up to 3 times.

        Returns: { ipfs_hash, ipfs_url, size_bytes }
        """
        path = "/pinning/pinFileToIPFS"

        for attempt in range(1, 4):
            try:
                data = aiohttp.FormData()
                data.add_field("file", file_bytes, filename=filename, content_type=mime_type)

                resp = await self._request("POST", path, data=data)
                ipfs_hash = resp.get("IpfsHash") or resp.get("ipfs_hash")
                if not ipfs_hash:
                    raise RuntimeError(f"Unexpected Pinata response: {resp}")
                return {"ipfs_hash": ipfs_hash, "ipfs_url": f"{self.GATEWAY}{ipfs_hash}", "size_bytes": len(file_bytes)}
            except Exception as e:
                if attempt == 3:
                    raise
                await asyncio.sleep(2 ** attempt)

    async def upload_json(self, data: dict, name: str) -> Dict[str, str]:
        """Upload JSON metadata to Pinata via pinJSONToIPFS.

        Returns: { ipfs_hash, ipfs_url }
        """
        path = "/pinning/pinJSONToIPFS"
        payload = {"pinataMetadata": {"name": name}, "pinataContent": data}
        resp = await self._request("POST", path, json=payload)
        ipfs_hash = resp.get("IpfsHash") or resp.get("ipfs_hash")
        if not ipfs_hash:
            raise RuntimeError(f"Unexpected Pinata response: {resp}")
        return {"ipfs_hash": ipfs_hash, "ipfs_url": f"{self.GATEWAY}{ipfs_hash}"}

    async def build_certificate_metadata(self, cert_data: dict, pdf_ipfs_hash: str) -> dict:
        """Build OpenSea-compatible NFT metadata JSON for a certificate.

        `cert_data` should include keys: learner_name, course_name, institution_name,
        completion_date (ISO string), grade, certificate_id, issued_by, issued_at_unix
        """
        name = f"SkillChain Certificate — {cert_data.get('course_name', '')}"
        description = (
            cert_data.get("description")
            or f"Certificate for {cert_data.get('course_name')} awarded to {cert_data.get('learner_name')} by {cert_data.get('institution_name')}"
        )

        external_url = f"{settings.FRONTEND_URL.rstrip('/')}/certificate/{cert_data.get('certificate_id')}"

        attributes = [
            {"trait_type": "Learner Name", "value": cert_data.get("learner_name")},
            {"trait_type": "Course Name", "value": cert_data.get("course_name")},
            {"trait_type": "Institution", "value": cert_data.get("institution_name")},
            {"trait_type": "Completion Date", "value": cert_data.get("completion_date")},
            {"trait_type": "Grade", "value": cert_data.get("grade")},
            {"trait_type": "NSQF Level", "value": cert_data.get("nsqf_level")},
            {"trait_type": "Certificate ID", "value": cert_data.get("certificate_id")},
            {"trait_type": "Issued By", "value": cert_data.get("issued_by")},
            {"display_type": "date", "trait_type": "Issue Timestamp", "value": cert_data.get("issued_at_unix")},
        ]

        metadata = {
            "name": name,
            "description": description,
            "image": f"ipfs://{pdf_ipfs_hash}",
            "external_url": external_url,
            "attributes": attributes,
        }
        return metadata

    async def pin_exists(self, ipfs_hash: str) -> bool:
        """Check if a pin job exists for the given hash to avoid duplicates."""
        path = f"/data/pinList?hashContains={ipfs_hash}"
        try:
            resp = await self._request("GET", path)
            # Pinata's pinList returns 'rows' array; consider exists if any row matches
            rows = resp.get("rows") if isinstance(resp, dict) else []
            return any(r.get("ipfs_pin_hash") == ipfs_hash or r.get("IpfsHash") == ipfs_hash for r in rows)
        except Exception:
            return False

    async def unpin(self, ipfs_hash: str) -> bool:
        """Unpin a file from Pinata so it can be garbage collected if desired."""
        path = f"/pinning/unpin/{ipfs_hash}"
        try:
            await self._request("DELETE", path)
            return True
        except Exception:
            return False


ipfs_service = IPFSService()
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
