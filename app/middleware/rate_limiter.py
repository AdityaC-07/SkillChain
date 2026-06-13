import time
from typing import Tuple

from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import JSONResponse


class RateLimiterMiddleware(BaseHTTPMiddleware):
    def __init__(self, app):
        super().__init__(app)
        # store: key -> (count, window_start)
        self.counters: dict[Tuple[str, str], Tuple[int, float]] = {}

    def _get_limits(self, path: str) -> int:
        if path.startswith("/api/certificates/verify"):
            return 100
        if path.startswith("/api/fraud/scan"):
            return 10
        if path.startswith("/api/auth/login"):
            return 5
        return 200

    async def dispatch(self, request: Request, call_next):
        ip = request.client.host or "unknown"
        path = request.url.path
        limit = self._get_limits(path)
        window = 60.0
        key = (ip, path)
        now = time.time()
        count, start = self.counters.get(key, (0, now))
        if now - start > window:
            count = 0
            start = now
        count += 1
        self.counters[key] = (count, start)
        if count > limit:
            retry_after = int(window - (now - start))
            return JSONResponse(status_code=429, content={"detail": "Rate limit exceeded"}, headers={"Retry-After": str(retry_after)})
        response = await call_next(request)
        return response
