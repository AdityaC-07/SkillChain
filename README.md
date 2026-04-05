# SkillChain (NCVET) — Python backend

FastAPI service for a blockchain-linked vocational certificate demo: IPFS (Pinata), Polygon Mumbai (web3.py), MongoDB (Beanie), JWT auth, optional fraud image scan (HuggingFace ViT), and mock DigiLocker hooks.

## Prerequisites

- Python 3.10+
- MongoDB (local or Atlas)
- (Optional) Pinata API keys, deployed `SkillCertificate` contract + funded wallet for mint/revoke on Mumbai

## Quick start

```bash
cd skillchain-backend
pip install -r requirements.txt
python seed.py
uvicorn main:app --reload --port 8000
```

Interactive docs: [http://localhost:8000/docs](http://localhost:8000/docs)

## Environment

Copy `.env` and set real values for production:

- `MONGODB_URI` — e.g. `mongodb://localhost:27017/skillchain`
- `JWT_SECRET` — long random string
- `PINATA_*` — for PDF + JSON metadata uploads
- `POLYGON_RPC_URL`, `PRIVATE_KEY`, `CONTRACT_ADDRESS` — on-chain mint/revoke (owner wallet must match contract `owner`)
- `FRONTEND_URL` — used in QR codes (`{FRONTEND_URL}/verify/{certificate_id}`)

Contract ABI is loaded from `app/contracts/abi.json` (update if you change the Solidity interface).

## Smart contract

`app/contracts/SkillCertificate.sol` is written for OpenZeppelin ^0.8.20. Compile and deploy with your toolchain (Hardhat/Foundry), then paste the deployed address into `CONTRACT_ADDRESS` and refresh `abi.json` if needed.

## Notes

- `seed.py` wipes `users`, `certificates`, and `audit_logs` in the configured database, then inserts demo data **without** calling the blockchain.
- The fraud endpoint uses `google/vit-base-patch16-224` as a placeholder signal; it is not a trained forgery detector.
- Polygon Mumbai may be deprecated upstream; switch `POLYGON_RPC_URL` to your preferred test network if Mumbai RPCs fail.
