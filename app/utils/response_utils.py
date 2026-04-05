"""Small helpers for consistent API payloads (language-key friendly)."""


def ok(data: dict) -> dict:
    """Wrap success payload; frontend can merge with i18n keys if needed."""
    return {"ok": True, **data}


def err(message: str, code: str | None = None) -> dict:
    """Structured error body for non-HTTPException responses."""
    body: dict = {"ok": False, "message": message}
    if code:
        body["code"] = code
    return body
