"""Input sanitization utilities for security."""

import bleach
from typing import Optional


def sanitize_text(text: str, tags: Optional[list] = None) -> str:
    """Sanitize text by stripping HTML/script tags using bleach.
    
    Args:
        text: Input text to sanitize
        tags: Optional list of allowed HTML tags (default: none)
    
    Returns:
        Sanitized text with all HTML/script tags removed
    """
    if not text:
        return text
    
    # Strip all tags by default, allow only specified tags if provided
    allowed_tags = tags or []
    return bleach.clean(text, tags=allowed_tags, strip=True)


def sanitize_certificate_fields(data: dict) -> dict:
    """Sanitize all text fields in certificate data.
    
    Args:
        data: Dictionary containing certificate fields
    
    Returns:
        Dictionary with sanitized text fields
    """
    text_fields = [
        'learner_name', 'course_name', 'institution_name', 
        'grade', 'completion_date'
    ]
    
    sanitized = data.copy()
    for field in text_fields:
        if field in sanitized and sanitized[field]:
            sanitized[field] = sanitize_text(sanitized[field])
    
    return sanitized
