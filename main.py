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
from app.core.config import settings, validate_environment
from app.routers import analytics, auth, certificates, digilocker, fraud
from app.services import fraud_service
from app.middleware.request_logger import RequestLoggerMiddleware
from app.middleware.rate_limiter import RateLimiterMiddleware
from app.middleware.error_handler import register_exception_handlers
from app.middleware.request_id import RequestIDMiddleware

# Register middleware and exception handlers


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Validate environment variables on startup
    validate_environment(settings)
    
    await init_db()
    # Warm HuggingFace weights in a background thread so the first /api/fraud/scan is faster.
    asyncio.get_running_loop().create_task(asyncio.to_thread(fraud_service.load_classifier_once))
    
    # Start background task to retry pending mints
    from app.services.pending_mint_service import start_pending_mint_scheduler
    asyncio.get_running_loop().create_task(start_pending_mint_scheduler())
    
    yield


app = FastAPI(title="SkillChain API", version="1.0.0", lifespan=lifespan)

# Attach middleware
app.add_middleware(RequestIDMiddleware)
app.add_middleware(RequestLoggerMiddleware)
app.add_middleware(RateLimiterMiddleware)

# Attach exception handlers
register_exception_handlers(app)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS.split(","),
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
    from app.services import ipfs_service
    from app.core.database import get_client
    from datetime import datetime

    # Check MongoDB connection
    mongo_ok = False
    try:
        client = get_client()
        await client.admin.command('ping')
        mongo_ok = True
    except Exception:
        mongo_ok = False

    # Check blockchain RPC connection
    blockchain_ok = False
    try:
        blockchain_ok = blockchain_service.chain_ready()
    except Exception:
        blockchain_ok = False

    # Check IPFS/Pinata connection
    ipfs_ok = False
    try:
        if ipfs_service.auth:
            # Try a simple API call to check connectivity
            await ipfs_service._request("GET", "/data/testAuthentication")
            ipfs_ok = True
    except Exception:
        ipfs_ok = False

    # Determine overall status
    all_ok = mongo_ok and blockchain_ok and ipfs_ok
    status = "ok" if all_ok else "degraded"

    return {
        "status": status,
        "checks": {
            "mongo": mongo_ok,
            "blockchain": blockchain_ok,
            "ipfs": ipfs_ok,
        },
        "timestamp": datetime.utcnow().isoformat(),
    }
