"""File upload validation utilities using magic bytes."""

import magic
from typing import Tuple, Optional
from fastapi import HTTPException


# File type magic bytes
PDF_MAGIC = b'%PDF'
JPEG_MAGIC = b'\xff\xd8\xff'
PNG_MAGIC = b'\x89PNG\r\n\x1a\n'
WEBP_MAGIC = b'RIFF'

# Size limits (in bytes)
MAX_PDF_SIZE = 5 * 1024 * 1024  # 5MB
MAX_IMAGE_SIZE = 10 * 1024 * 1024  # 10MB


def validate_pdf_upload(file_bytes: bytes, filename: Optional[str] = None) -> None:
    """Validate PDF upload by size and magic bytes.
    
    Args:
        file_bytes: Raw file bytes
        filename: Optional filename for error messages
    
    Raises:
        HTTPException: If validation fails
    """
    # Check size
    if len(file_bytes) > MAX_PDF_SIZE:
        raise HTTPException(
            status_code=413,
            detail=f"PDF file too large (max {MAX_PDF_SIZE // (1024*1024)}MB)"
        )
    
    if len(file_bytes) == 0:
        raise HTTPException(status_code=400, detail="PDF file is empty")
    
    # Check magic bytes
    if not file_bytes.startswith(PDF_MAGIC):
        raise HTTPException(
            status_code=400,
            detail="Invalid file type: not a PDF (magic bytes mismatch)"
        )
    
    # Optional: verify with python-magic if available
    try:
        mime = magic.from_buffer(file_bytes, mime=True)
        if mime != 'application/pdf':
            raise HTTPException(
                status_code=400,
                detail=f"Invalid file type: expected PDF, got {mime}"
            )
    except Exception:
        # Fallback to magic bytes check if python-magic fails
        pass


def validate_image_upload(file_bytes: bytes, filename: Optional[str] = None) -> None:
    """Validate image upload (JPEG/PNG/WebP) by size and magic bytes.
    
    Args:
        file_bytes: Raw file bytes
        filename: Optional filename for error messages
    
    Raises:
        HTTPException: If validation fails
    """
    # Check size
    if len(file_bytes) > MAX_IMAGE_SIZE:
        raise HTTPException(
            status_code=413,
            detail=f"Image file too large (max {MAX_IMAGE_SIZE // (1024*1024)}MB)"
        )
    
    if len(file_bytes) == 0:
        raise HTTPException(status_code=400, detail="Image file is empty")
    
    # Check magic bytes
    is_jpeg = file_bytes.startswith(JPEG_MAGIC)
    is_png = file_bytes.startswith(PNG_MAGIC)
    is_webp = file_bytes.startswith(WEBP_MAGIC) and b'WEBP' in file_bytes[:12]
    
    if not (is_jpeg or is_png or is_webp):
        raise HTTPException(
            status_code=400,
            detail="Invalid file type: must be JPEG, PNG, or WebP (magic bytes mismatch)"
        )
    
    # Optional: verify with python-magic if available
    try:
        mime = magic.from_buffer(file_bytes, mime=True)
        allowed_mimes = {'image/jpeg', 'image/png', 'image/webp'}
        if mime not in allowed_mimes:
            raise HTTPException(
                status_code=400,
                detail=f"Invalid file type: expected JPEG/PNG/WebP, got {mime}"
            )
    except Exception:
        # Fallback to magic bytes check if python-magic fails
        pass


def get_file_type_info(file_bytes: bytes) -> Tuple[str, str]:
    """Get file type information from magic bytes.
    
    Args:
        file_bytes: Raw file bytes
    
    Returns:
        Tuple of (mime_type, description)
    """
    try:
        mime = magic.from_buffer(file_bytes, mime=True)
        description = magic.from_buffer(file_bytes)
        return mime, description
    except Exception:
        # Fallback to basic magic byte detection
        if file_bytes.startswith(PDF_MAGIC):
            return 'application/pdf', 'PDF document'
        elif file_bytes.startswith(JPEG_MAGIC):
            return 'image/jpeg', 'JPEG image'
        elif file_bytes.startswith(PNG_MAGIC):
            return 'image/png', 'PNG image'
        elif file_bytes.startswith(WEBP_MAGIC):
            return 'image/webp', 'WebP image'
        else:
            return 'application/octet-stream', 'Unknown file type'
