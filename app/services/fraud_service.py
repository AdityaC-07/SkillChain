"""
Certificate image screening using a Vision Transformer classifier.

The public model is not trained on forged certificates; this is a demo hook
where we use the top prediction confidence as a simple anomaly-style score.
"""

from __future__ import annotations

import asyncio
from io import BytesIO
from typing import Any

from PIL import Image
from transformers import pipeline

_classifier: Any = None


def load_classifier_once() -> None:
    """
    Load the HuggingFace pipeline a single time (heavy download on first run).
    Called from FastAPI lifespan so the first /api/fraud/scan stays responsive.
    """
    global _classifier
    if _classifier is None:
        _classifier = pipeline(
            "image-classification",
            model="google/vit-base-patch16-224",
        )


def _analyze_sync(image_bytes: bytes) -> dict[str, Any]:
    load_classifier_once()
    image = Image.open(BytesIO(image_bytes)).convert("RGB")
    results = _classifier(image)
    top = results[0] if results else {"label": "unknown", "score": 0.0}
    label = str(top.get("label", ""))
    confidence = float(top.get("score", 0.0))
    fraud_score = confidence

    if fraud_score > 0.8:
        verdict = "GENUINE"
    elif fraud_score >= 0.5:
        verdict = "SUSPICIOUS"
    else:
        verdict = "FAKE"

    details = "; ".join(f"{r['label']}: {r['score']:.3f}" for r in results[:5])
    return {
        "fraud_score": fraud_score,
        "verdict": verdict,
        "confidence": confidence,
        "details": details or label,
    }


async def analyze_image(image_bytes: bytes) -> dict[str, Any]:
    """Run classifier in a thread pool so the async event loop is not blocked."""
    return await asyncio.to_thread(_analyze_sync, image_bytes)
