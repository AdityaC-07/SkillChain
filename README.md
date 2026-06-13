# SkillChain — Blockchain-Powered Vocational Credentials

Overview
--------
SkillChain issues verifiable, blockchain-backed vocational certificates to learners and institutions. It stores cryptographic proofs on Polygon (Mumbai) and the certificate artifacts on IPFS; a backend AI fraud detector analyzes uploaded certificates for tampering.

Built for high integrity and easy verification, SkillChain helps institutions issue credentials that employers and government agencies can trust.

Architecture Diagram
--------------------
Frontend → FastAPI Backend → MongoDB
                          ↓
                    Blockchain Service → Polygon Mumbai
                          ↓
                    IPFS Service → Pinata
                          ↓
                    AI Fraud Service → HuggingFace ViT

Quick Start
-----------

Prerequisites
- Python 3.11+
- Node 20+
- MongoDB (or Docker)
- MetaMask (for interacting with deployed contracts)

1. Clone and setup
```bash
git clone <repo>
cd SkillChain
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
```

2. Configure `.env`
- `MONGODB_URI` - MongoDB connection string (default mongodb://localhost:27017/skillchain)
- `JWT_SECRET` - JWT signing secret
- `JWT_EXPIRE_MINUTES` - token expiry in minutes
- `PINATA_API_KEY`, `PINATA_SECRET_KEY` - Pinata credentials
- `POLYGON_RPC_URL` - Polygon RPC endpoint (Mumbai testnet)
- `PRIVATE_KEY` - Deployer private key for contracts
- `CONTRACT_ADDRESS` - deployed SkillCertificate contract address (optional)
- `FRONTEND_URL` - URL where frontend is hosted (for share links)

3. Deploy smart contract
```bash
python app/contracts/deploy.py
# Copy the deployed address into .env as CONTRACT_ADDRESS
```

4. Seed database
```bash
python seed.py
```

5. Start backend
```bash
uvicorn main:app --reload --port 8000
```

6. Start frontend
```bash
cd skillchain-frontend
npm install
npm run dev
```

7. Run with Docker
```bash
docker-compose up --build
```

API Reference
-------------
Method | Endpoint | Auth | Description
---|---|---|---
POST | /api/auth/register | No | Register user (learner/institute)
POST | /api/auth/login | No | Login and retrieve JWT
GET | /api/auth/me | Yes | Get current user
POST | /api/certificates/issue | Yes (institute) | Issue a certificate and mint NFT
GET | /api/certificates/verify/{id} | Public | Verify certificate status
POST | /api/digilocker/push/{id} | Yes (learner) | Push to DigiLocker sandbox
GET | /api/analytics/stats | Public | Landing page stats
... | ... | ... | More endpoints documented in code

Test Accounts (seed.py)
- Institute: institute@skillchain.test / SkillChain@2025
- Learner: ravi.kumar@test.com / Learner@2025

Key Features
- ✅ Blockchain-backed certificates
- ✅ IPFS storage for certificate artifacts
- ✅ AI fraud detection using vision models
- ✅ DigiLocker sandbox integration

Tech Stack
- Frontend: React (Vite, Tailwind)
- Backend: FastAPI, Beanie, MongoDB
- Blockchain: web3.py, Polygon Mumbai
- Storage: IPFS (Pinata)

Blockchain Details
- Network: Polygon Mumbai (testnet)
- Contract: `SkillCertificate` (deploy via `app/contracts/deploy.py`)

Project Structure
```
LICENSE
main.py
app/
  contracts/
  core/
  models/
  routers/
  services/
skillchain-frontend/
tests/
```

Contributing
------------
Please open issues and PRs. This project is MIT licensed.
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
