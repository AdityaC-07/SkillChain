"""Request ID middleware for debugging and tracing."""

import uuid
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request


class RequestIDMiddleware(BaseHTTPMiddleware):
    """Middleware that adds a unique X-Request-ID header to every response."""
    
    async def dispatch(self, request: Request, call_next):
        # Generate or retrieve request ID
        request_id = request.headers.get("X-Request-ID") or str(uuid.uuid4())
        
        # Attach to request state for use in endpoints
        request.state.request_id = request_id
        
        # Process request
        response = await call_next(request)
        
        # Add X-Request-ID header to response
        response.headers["X-Request-ID"] = request_id
        
        return response
