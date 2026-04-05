"""
Blockchain integration for SkillChain (Polygon Mumbai + ERC-721).

This module uses web3.py to talk to an Ethereum-compatible JSON-RPC node.
Think of the blockchain as a shared ledger: transactions change state (cost gas),
while *calls* only read data (free, no wallet signature needed).
"""

from __future__ import annotations

import asyncio
from typing import Any

from eth_account import Account
from web3 import Web3
from web3.exceptions import ContractLogicError

from app.core.config import settings

# -----------------------------------------------------------------------------
# 1) Connect to Polygon Mumbai through an HTTP RPC URL from .env
#    The provider forwards your requests to a node synced with the testnet.
# -----------------------------------------------------------------------------
_w3: Web3 | None = None
_contract: Any = None


def _get_w3() -> Web3:
    global _w3
    if _w3 is None:
        _w3 = Web3(Web3.HTTPProvider(settings.POLYGON_RPC_URL))
    return _w3


def _get_contract():
    """
    2) Bind the deployed SkillCertificate contract: address + ABI describe *what*
       functions exist and how to encode/decode them for the node.
    """
    global _contract
    if _contract is None:
        if not settings.CONTRACT_ADDRESS or not settings.CONTRACT_ABI:
            raise ValueError(
                "CONTRACT_ADDRESS and contracts/abi.json must be configured before on-chain actions."
            )
        w3 = _get_w3()
        _contract = w3.eth.contract(
            address=Web3.to_checksum_address(settings.CONTRACT_ADDRESS),
            abi=settings.CONTRACT_ABI,
        )
    return _contract


def _institute_account() -> Account:
    """Load the institute wallet from PRIVATE_KEY (must match contract owner for mint/revoke)."""
    if not settings.PRIVATE_KEY:
        raise ValueError("PRIVATE_KEY is not set in .env")
    key = settings.PRIVATE_KEY.strip()
    if key.startswith("0x"):
        key = key[2:]
    return Account.from_key(key)


def _raw_signed_bytes(signed_tx) -> bytes:
    """web3 / eth_account versions differ on attribute name for serialized tx bytes."""
    if hasattr(signed_tx, "raw_transaction"):
        return signed_tx.raw_transaction
    return signed_tx.rawTransaction


def _build_and_send_tx(contract_fn):
    """
    3) Build a transaction object (who pays, which function, args, gas, nonce...),
       4) sign it with the private key (proves you authorize spending gas + changing state),
       5) broadcast raw bytes to the network via send_raw_transaction.
    Returns the transaction hash as HexBytes.
    """
    w3 = _get_w3()
    acct = _institute_account()
    chain_id = w3.eth.chain_id

    tx = contract_fn.build_transaction(
        {
            "from": acct.address,
            "nonce": w3.eth.get_transaction_count(acct.address),
            "gas": 500_000,
            "gasPrice": w3.eth.gas_price,
            "chainId": chain_id,
        }
    )
    signed = w3.eth.account.sign_transaction(tx, private_key=acct.key)
    return w3.eth.send_raw_transaction(_raw_signed_bytes(signed))


def _mint_certificate_sync(to_address: str, token_uri: str) -> tuple[int, str]:
    w3 = _get_w3()
    contract = _get_contract()
    to_checksum = Web3.to_checksum_address(to_address)

    # mintCertificate is a *state-changing* function → must be a signed transaction.
    fn = contract.functions.mintCertificate(to_checksum, token_uri)
    tx_hash = _build_and_send_tx(fn)
    receipt = w3.eth.wait_for_transaction_receipt(tx_hash)
    tx_hash_hex = Web3.to_hex(tx_hash)

    # Parse CertificateIssued event to recover the new token id (return value is not on receipt).
    issued = contract.events.CertificateIssued().process_receipt(receipt)
    if not issued:
        raise RuntimeError("Mint receipt contained no CertificateIssued event; check ABI/contract.")
    token_id = int(issued[0]["args"]["tokenId"])
    return token_id, tx_hash_hex


async def mint_certificate(to_address: str, token_uri: str) -> dict[str, Any]:
    """Mint an NFT certificate to the learner wallet; returns token_id and tx_hash."""
    token_id, tx_hash_hex = await asyncio.to_thread(_mint_certificate_sync, to_address, token_uri)
    return {"token_id": token_id, "tx_hash": tx_hash_hex}


def _verify_certificate_sync(token_id: int) -> dict[str, Any]:
    """
    Read tokenURI + owner without spending gas (call, not transaction).
    If the token was burned, the contract reverts — we surface that as invalid.
    """
    contract = _get_contract()
    try:
        uri, owner = contract.functions.verifyCertificate(int(token_id)).call()
        return {"token_uri": uri, "owner": owner}
    except ContractLogicError:
        return {"token_uri": None, "owner": None}


async def verify_certificate(token_id: int) -> dict[str, Any]:
    """On-chain read: metadata URI and current owner for a token id."""
    return await asyncio.to_thread(_verify_certificate_sync, token_id)


def _revoke_certificate_sync(token_id: int) -> str:
    """Burn the NFT (revoke) — only works if signer is contract owner."""
    contract = _get_contract()
    fn = contract.functions.revokeCertificate(int(token_id))
    tx_hash = _build_and_send_tx(fn)
    w3 = _get_w3()
    w3.eth.wait_for_transaction_receipt(tx_hash)
    return Web3.to_hex(tx_hash)


async def revoke_certificate(token_id: int) -> str:
    """Revoke (burn) certificate on-chain; returns transaction hash."""
    return await asyncio.to_thread(_revoke_certificate_sync, token_id)


def chain_ready() -> bool:
    """True if RPC responds (used for health / graceful degradation)."""
    try:
        w3 = _get_w3()
        return w3.is_connected()
    except Exception:
        return False
