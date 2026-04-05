"""
SkillChain (NCVET) — FastAPI entrypoint.

Run from this directory:
  uvicorn main:app --reload --port 8000
"""

import asyncio
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.database import init_db
from app.routers import analytics, auth, certificates, digilocker, fraud
from app.services import fraud_service


@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_db()
    # Warm HuggingFace weights in a background thread so the first /api/fraud/scan is faster.
    asyncio.get_running_loop().create_task(asyncio.to_thread(fraud_service.load_classifier_once))
    yield


app = FastAPI(title="SkillChain API", version="1.0.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(certificates.router)
app.include_router(fraud.router)
app.include_router(digilocker.router)
app.include_router(analytics.router)


@app.get("/health")
async def health():
    from app.services import blockchain_service

    return {
        "status": "ok",
        "chain": "Polygon Mumbai",
        "rpc_reachable": blockchain_service.chain_ready(),
    }
