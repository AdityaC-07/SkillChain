import traceback
from uuid import uuid4

from fastapi import Request
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from fastapi import HTTPException
import structlog

log = structlog.get_logger()


def register_exception_handlers(app):
    @app.exception_handler(HTTPException)
    async def http_exc_handler(request: Request, exc: HTTPException):
        request_id = str(uuid4())
        return JSONResponse(status_code=exc.status_code, content={"success": False, "error": {"code": "HTTP_ERROR", "message": exc.detail, "request_id": request_id}})

    @app.exception_handler(RequestValidationError)
    async def validation_exception_handler(request: Request, exc: RequestValidationError):
        request_id = str(uuid4())
        errors = exc.errors()
        return JSONResponse(status_code=422, content={"success": False, "error": {"code": "VALIDATION_ERROR", "message": "Invalid input", "details": errors, "request_id": request_id}})

    @app.exception_handler(Exception)
    async def generic_exception_handler(request: Request, exc: Exception):
        request_id = str(uuid4())
        tb = traceback.format_exc()
        log.error("unhandled_exception", error=str(exc), traceback=tb, request_id=request_id, path=request.url.path)
        return JSONResponse(status_code=500, content={"success": False, "error": {"code": "INTERNAL_ERROR", "message": "An internal error occurred", "request_id": request_id}})
