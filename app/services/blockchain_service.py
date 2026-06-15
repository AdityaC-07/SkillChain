"""
Async blockchain service for SkillChain.

This service provides async-friendly wrappers around blocking web3.py calls
using `asyncio.to_thread(...)` so it can be used safely inside FastAPI.

Beginner notes:
- Private key: a secret that proves ownership of an account. It NEVER leaves the
  server in plaintext apart from secure env vars and is used to sign transactions.
- Nonce: a per-account sequential counter used to prevent replay and order txs.
  We MUST read the latest nonce before sending a signed tx to avoid collisions.
- Gas: the unit of work on Ethereum networks. We estimate gas so the node can
  validate the tx cost before it is mined. Over/under-estimating can cause
  failed transactions or wasted ETH.
- Transaction receipt: returned once a tx is mined (included in a block). It
  contains `blockNumber`, `gasUsed`, and logs (events) emitted by the contract.
- Event logs: compact indexed data stored with receipts. We parse logs to find
  values like `tokenId` emitted by `CertificateIssued` because functions that
  mint often do not return values directly in the receipt.
"""

from __future__ import annotations

import asyncio
import json
import time
from pathlib import Path
from typing import Any, Dict, Optional

from eth_account import Account
from web3 import Web3
from web3.exceptions import ContractLogicError

from app.core.config import settings


class BlockchainService:
    def __init__(self):
        """Connect to RPC, load contract, and prepare the institute account.

        This constructor performs only lightweight synchronous operations. Heavy
        network actions are executed in the async methods via `to_thread`.
        """
        self.disabled = False
        # Connect to Polygon Mumbai via RPC URL from settings
        self.rpc = settings.POLYGON_RPC_URL
        self.w3 = Web3(Web3.HTTPProvider(self.rpc))

        # Load deployed contract info from bundled file (deployed.json) if present
        deployed_path = Path(__file__).resolve().parent.parent / "contracts" / "deployed.json"
        contract_address = settings.CONTRACT_ADDRESS
        contract_abi = settings.CONTRACT_ABI

        if deployed_path.is_file():
            try:
                data = json.loads(deployed_path.read_text(encoding="utf-8"))
                contract_address = data.get("address") or contract_address
                contract_abi = data.get("abi") or contract_abi
            except Exception:
                # keep falling back to settings if file is malformed
                pass

        if not contract_address or not contract_abi:
            # Allow running without contract for development/testing
            self.contract = None
            self.private_key = None
            self.account = None
            self.disabled = True
            return

        self.contract = self.w3.eth.contract(address=Web3.to_checksum_address(contract_address), abi=contract_abi)

        # Load institute wallet from PRIVATE_KEY in settings
        if not settings.PRIVATE_KEY:
            self.private_key = None
            self.account = None
            self.disabled = True
            return
        key = settings.PRIVATE_KEY.strip()
        if key.startswith("0x"):
            key = key[2:]
        self.private_key = key
        self.account = Account.from_key(self.private_key)

        # NOTE: nonce is fetched per-transaction to avoid races; see `nonce` comment above.

    # -------------------- Utility helpers --------------------
    async def _wait_for_receipt(self, tx_hash: bytes, timeout: int = 120, poll_interval: float = 2.0) -> Dict[str, Any]:
        """Poll for transaction receipt with timeout. Runs in a thread to avoid blocking the loop."""
        def _wait():
            start = time.time()
            while True:
                try:
                    receipt = self.w3.eth.get_transaction_receipt(tx_hash)
                    if receipt is not None:
                        return dict(receipt)
                except Exception:
                    pass
                if time.time() - start > timeout:
                    raise TimeoutError("Timed out waiting for transaction receipt")
                time.sleep(poll_interval)

        return await asyncio.to_thread(_wait)

    async def mint_certificate(self, to_address: str, token_uri: str) -> Dict[str, Any]:
        """Mint a certificate NFT and return details including token id and gas used.

        Steps:
        - Build transaction with gas estimation
        - Sign with private key
        - Send raw transaction
        - Poll for receipt (timeout: 120s)
        - Parse `CertificateIssued` event to extract `tokenId`
        """
        if not Web3.is_address(to_address):
            raise ValueError("Invalid recipient address")

        to_checksum = Web3.to_checksum_address(to_address)

        fn = self.contract.functions.mintCertificate(to_checksum, token_uri)

        try:
            # Build transaction fields
            nonce = self.w3.eth.get_transaction_count(self.account.address, "pending")
            gas_estimate = fn.estimate_gas({"from": self.account.address})
            gas_price = self.w3.eth.gas_price
            tx = fn.build_transaction({
                "from": self.account.address,
                "nonce": nonce,
                "gas": int(gas_estimate * 1.2),
                "gasPrice": gas_price,
            })

            # Sign the transaction
            signed = self.w3.eth.account.sign_transaction(tx, private_key=self.private_key)

            # Send raw transaction
            tx_hash = await asyncio.to_thread(self.w3.eth.send_raw_transaction, signed.rawTransaction)

            # Wait for receipt
            receipt = await self._wait_for_receipt(tx_hash, timeout=120, poll_interval=2)

            # Parse CertificateIssued event from receipt logs using the receipt object
            receipt_obj = self.w3.eth.get_transaction_receipt(tx_hash)
            try:
                issued = self.contract.events.CertificateIssued().process_receipt(receipt_obj)
            except Exception:
                issued = []

            token_id: Optional[int] = None
            if issued:
                token_id = int(issued[0]["args"]["tokenId"])

            return {
                "token_id": token_id,
                "tx_hash": Web3.to_hex(tx_hash),
                "block_number": receipt.get("blockNumber"),
                "gas_used": receipt.get("gasUsed"),
            }

        except ValueError as e:
            msg = str(e)
            if "insufficient funds" in msg.lower():
                raise RuntimeError("Insufficient funds to send transaction")
            raise

    async def verify_certificate(self, token_id: int) -> Dict[str, Any]:
        """Read certificate metadata and status without spending gas.

        Returns: { token_uri, owner_address, issuer_address, is_revoked, exists }
        """
        try:
            uri, owner, issuer, is_revoked = await asyncio.to_thread(
                lambda: self.contract.functions.verifyCertificate(int(token_id)).call()
            )
            exists = owner != "0x0000000000000000000000000000000000000000"
            return {
                "token_uri": uri,
                "owner_address": owner,
                "issuer_address": issuer,
                "is_revoked": is_revoked,
                "exists": exists,
            }
        except ContractLogicError:
            return {"token_uri": None, "owner_address": None, "issuer_address": None, "is_revoked": False, "exists": False}

    async def revoke_certificate(self, token_id: int) -> Dict[str, Any]:
        """Revoke a certificate by calling `revokeCertificate(tokenId)`.

        Returns: { tx_hash, block_number }
        """
        fn = self.contract.functions.revokeCertificate(int(token_id))
        try:
            nonce = self.w3.eth.get_transaction_count(self.account.address, "pending")
            gas_estimate = fn.estimate_gas({"from": self.account.address})
            gas_price = self.w3.eth.gas_price
            tx = fn.build_transaction({
                "from": self.account.address,
                "nonce": nonce,
                "gas": int(gas_estimate * 1.2),
                "gasPrice": gas_price,
            })

            signed = self.w3.eth.account.sign_transaction(tx, private_key=self.private_key)
            tx_hash = await asyncio.to_thread(self.w3.eth.send_raw_transaction, signed.rawTransaction)
            receipt = await self._wait_for_receipt(tx_hash, timeout=120, poll_interval=2)
            return {"tx_hash": Web3.to_hex(tx_hash), "block_number": receipt.get("blockNumber")}
        except ValueError as e:
            msg = str(e)
            if "insufficient funds" in msg.lower():
                raise RuntimeError("Insufficient funds to send transaction")
            raise

    async def get_total_certificates(self) -> int:
        """Call `totalSupply()` to get number of certificates ever minted."""
        return await asyncio.to_thread(lambda: int(self.contract.functions.totalSupply().call()))

    async def is_valid_address(self, address: str) -> bool:
        """Validate an Ethereum address format (checksum or non-checksum)."""
        return Web3.is_address(address)

    def chain_ready(self) -> bool:
        """Check if blockchain service is ready (has contract configured)."""
        return not self.disabled


# Create singleton instance
blockchain_service = BlockchainService()

