import time
import structlog
from uuid import uuid4

from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from app.utils.jwt_utils import decode_token

log = structlog.get_logger()


class RequestLoggerMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        path = request.url.path
        if path.startswith("/health") or path.startswith("/docs"):
            return await call_next(request)

        start = time.time()
        request_id = str(uuid4())
        user_id = None
        try:
            auth = request.headers.get("authorization")
            if auth and auth.lower().startswith("bearer "):
                token = auth.split(None, 1)[1]
                payload = decode_token(token)
                user_id = payload.get("sub")
        except Exception:
            user_id = None

        response = await call_next(request)
        ms = int((time.time() - start) * 1000)
        log.info("http.request", method=request.method, path=path, status_code=response.status_code, response_time_ms=ms, user_id=user_id, ip_address=request.client.host, request_id=request_id)
        return response
