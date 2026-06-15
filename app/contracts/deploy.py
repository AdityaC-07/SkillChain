"""Compile and deploy the SkillCertificate contract to Polygon Mumbai.

Usage:
  - Ensure .env contains PRIVATE_KEY and POLYGON_RPC_URL (or set env vars).
  - Run: `python app/contracts/deploy.py`

This script will:
  - install solc 0.8.20 via py-solc-x if needed
  - compile SkillCertificate.sol
  - deploy contract using the PRIVATE_KEY
  - save deployed address and ABI to app/contracts/deployed.json
  - save the ABI array to app/contracts/abi.json
"""

import json
import os
import sys
from pathlib import Path

from dotenv import load_dotenv
from solcx import compile_source, get_solc_version, install_solc, set_solc_version
from web3 import Web3
from web3.middleware import geth_poa_middleware
from web3.exceptions import ContractCustomError, TransactionNotFound


ROOT = Path(__file__).resolve().parent
CONTRACT_PATH = ROOT / "SkillCertificate.sol"
DEPLOYED_JSON = ROOT / "deployed.json"
ABI_JSON = ROOT / "abi.json"


def load_env():
    load_dotenv(dotenv_path=Path(".env"))
    rpc = os.getenv("POLYGON_RPC_URL") or os.getenv("RPC_URL")
    private_key = os.getenv("PRIVATE_KEY")
    if not rpc:
        print("Error: POLYGON_RPC_URL not set in environment or .env")
        sys.exit(1)
    return rpc, private_key


def get_openzeppelin_version(project_root: Path) -> str:
    pkg_path = project_root / "node_modules" / "@openzeppelin" / "contracts" / "package.json"
    if pkg_path.is_file():
        try:
            data = json.loads(pkg_path.read_text(encoding="utf-8"))
            return data.get("version", "unknown")
        except Exception:
            return "unknown"
    return "not installed"


def compile_contract(sol_path: Path):
    if not sol_path.is_file():
        raise FileNotFoundError(f"Contract source not found: {sol_path}")

    project_root = ROOT.parent.parent
    openzeppelin_path = project_root / "node_modules" / "@openzeppelin"
    openzeppelin_version = get_openzeppelin_version(project_root)

    try:
        install_solc("0.8.35")
        set_solc_version("0.8.35")
    except Exception as e:
        raise RuntimeError(f"Failed to install or set solc: {e}")

    source = sol_path.read_text(encoding="utf-8")

    if not openzeppelin_path.is_dir():
        raise RuntimeError(
            "OpenZeppelin contracts not found. Run `npm install @openzeppelin/contracts` in the project root."
        )

    import_remappings = ["@openzeppelin/=node_modules/@openzeppelin/"]
    allow_paths = [str(project_root), str(project_root / "node_modules")]

    try:
        compiled = compile_source(
            source,
            output_values=["abi", "bin"],
            base_path=str(project_root),
            allow_paths=allow_paths,
            import_remappings=import_remappings,
        )  # returns dict
    except Exception as e:
        solc_version = get_solc_version() if get_solc_version() else "unknown"
        raise RuntimeError(
            f"Solidity compilation failed: {e}\n"
            f"OpenZeppelin version: {openzeppelin_version}\n"
            f"Solc version: {solc_version}"
        )

    # compile_source returns a dict keyed by '<stdin>:ContractName'
    contract_key = None
    for k in compiled:
        if k.endswith(":SkillCertificate"):
            contract_key = k
            break
    if contract_key is None:
        raise RuntimeError("Compiled contract 'SkillCertificate' not found in compiler output")

    contract_interface = compiled[contract_key]
    abi = contract_interface.get("abi")
    bytecode = contract_interface.get("bin")

    if not abi or not bytecode:
        raise RuntimeError("ABI or bytecode missing from compilation result")

    return abi, bytecode


def deploy(abi, bytecode, rpc_url: str, private_key: str):
    w3 = Web3(Web3.HTTPProvider(rpc_url))
    w3.middleware_onion.inject(geth_poa_middleware, layer=0)
    if not w3.is_connected():
        raise ConnectionError("Unable to connect to RPC URL")

    account = w3.eth.account.from_key(private_key)
    deployer = account.address

    Contract = w3.eth.contract(abi=abi, bytecode=bytecode)

    try:
        nonce = w3.eth.get_transaction_count(deployer)
        chain_id = w3.eth.chain_id

        # Estimate gas
        construct_txn = Contract.constructor().build_transaction({
            "from": deployer,
            "nonce": nonce,
        })

        gas_estimate = w3.eth.estimate_gas(construct_txn)
        gas_price = w3.eth.gas_price

        tx = Contract.constructor().build_transaction(
            {
                "from": deployer,
                "nonce": nonce,
                "gas": int(gas_estimate * 1.2),
                "gasPrice": gas_price,
                "chainId": chain_id,
            }
        )

        signed = account.sign_transaction(tx)
        tx_hash = w3.eth.send_raw_transaction(signed.rawTransaction)

        print(f"Deployment tx sent: {tx_hash.hex()} - waiting for receipt...")
        receipt = w3.eth.wait_for_transaction_receipt(tx_hash, timeout=300)

        contract_address = receipt.contractAddress

        result = {
            "address": contract_address,
            "tx_hash": tx_hash.hex(),
            "block_number": receipt.blockNumber,
            "gas_used": receipt.gasUsed,
        }

        return result

    except ValueError as e:
        # web3/ethereum node returned an error
        raise RuntimeError(f"RPC / Transaction error: {e}")
    except TransactionNotFound:
        raise RuntimeError("Transaction not found after sending")


def save_deployment(deployed_info: dict, abi: list):
    DEPLOYED_JSON.write_text(json.dumps({"address": deployed_info["address"], "abi": abi}, indent=2), encoding="utf-8")
    ABI_JSON.write_text(json.dumps(abi, indent=2), encoding="utf-8")


def main():
    try:
        rpc_url, private_key = load_env()

        print("Compiling contract...")
        abi, bytecode = compile_contract(CONTRACT_PATH)

        if not private_key:
            print("Compilation successful, skipping deployment — no PRIVATE_KEY set")
            ABI_JSON.write_text(json.dumps(abi, indent=2), encoding="utf-8")
            return

        print("Deploying contract to RPC:", rpc_url)
        deployed = deploy(abi, bytecode, rpc_url, private_key)

        save_deployment(deployed, abi)

        print("Deployment complete")
        print(json.dumps(deployed, indent=2))

    except FileNotFoundError as e:
        print("File error:", e)
        sys.exit(1)
    except ConnectionError as e:
        print("Connection error:", e)
        sys.exit(1)
    except RuntimeError as e:
        msg = str(e)
        if "insufficient funds" in msg.lower():
            print("Error: Insufficient funds in deployer account to cover gas.")
        else:
            print("Runtime error:", e)
        sys.exit(1)
    except Exception as e:
        print("Unexpected error:", e)
        sys.exit(1)


if __name__ == "__main__":
    main()
