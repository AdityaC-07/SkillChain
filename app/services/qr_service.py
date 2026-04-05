"""Generate QR codes that deep-link to the public verify page on the frontend."""

import base64
from io import BytesIO

import qrcode

from app.core.config import settings


def generate_qr(certificate_id: str) -> str:
    """
    Encode FRONTEND_URL/verify/{certificate_id} into a PNG QR code.
    Returns raw base64 (no data: prefix); prefix with data:image/png;base64, for <img src>.
    """
    url = f"{settings.FRONTEND_URL.rstrip('/')}/verify/{certificate_id}"
    img = qrcode.make(url)
    buf = BytesIO()
    img.save(buf, format="PNG")
    return base64.b64encode(buf.getvalue()).decode("ascii")
