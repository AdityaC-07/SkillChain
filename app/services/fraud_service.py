"""Fraud detection service for certificate images.

Provides a multi-signal pipeline combining a lightweight ML classifier and
several heuristic image-based checks to score potential tampering.
"""
from __future__ import annotations

import asyncio
import hashlib
import time
from typing import Dict

import numpy as np
from PIL import Image, ImageFilter, ImageStat, ExifTags
from transformers import pipeline


class FraudDetectionService:
    def __init__(self):
        # Classifier will be loaded lazily by `load_classifier_once` to avoid
        # blocking import time. We keep a simple flag and placeholder.
        self.classifier = None
        self.model_loaded = False
        self.model_load_time = None

    def load_classifier_once(self):
        """Synchronous loader intended to be run in a background thread at startup.

        Loads a lightweight image classifier pipeline. If loading fails, we
        fallback to rule-based signals only.
        """
        if self.model_loaded:
            return

        start = time.time()
        try:
            # Using a smaller ResNet model for faster inference
            self.classifier = pipeline("image-classification", model="microsoft/resnet-50")
            self.model_loaded = True
        except Exception:
            # Keep classifier as None and continue with heuristics only
            self.classifier = None
            self.model_loaded = False
        finally:
            self.model_load_time = time.time() - start

    async def analyze_certificate(self, image_bytes: bytes) -> Dict:
        """Run the 4-signal fraud pipeline and return a structured result.

        Composite score: 0.0 (genuine) to 1.0 (fake).
        """
        start_time = time.time()

        # Run signals concurrently
        tasks = [
            self._run_ml_analysis(image_bytes),
            self._check_image_metadata(image_bytes),
            self._detect_visual_anomalies(image_bytes),
            self._analyze_text_regions(image_bytes),
        ]

        ml_score, meta_score, visual_score, text_score = await asyncio.gather(*tasks)

        composite_score = (
            ml_score * 0.40 + meta_score * 0.20 + visual_score * 0.25 + text_score * 0.15
        )

        result = {
            "fraud_score": round(float(composite_score), 4),
            "verdict": self._get_verdict(composite_score),
            "confidence": self._get_confidence(composite_score),
            "signals": {
                "ml_model": {"score": round(float(ml_score), 4), "weight": "40%"},
                "metadata_integrity": {"score": round(float(meta_score), 4), "weight": "20%"},
                "visual_anomaly": {"score": round(float(visual_score), 4), "weight": "25%"},
                "text_region": {"score": round(float(text_score), 4), "weight": "15%"},
            },
            "verdict_label": self._get_verdict_label(composite_score),
            "recommendation": self._get_recommendation(composite_score),
            "processing_time_ms": int((time.time() - start_time) * 1000),
        }

        return result

    async def _run_ml_analysis(self, image_bytes: bytes) -> float:
        """Run the classifier and map outputs to a fraud probability.

        Returns 0.0-1.0 where higher means more likely fraudulent.
        If model isn't loaded, return a neutral 0.5 (medium suspicion) to let
        heuristics dominate.
        """
        if not self.model_loaded or self.classifier is None:
            return 0.5

        def _classify():
            img = Image.open(io := __import__("io").BytesIO(image_bytes)).convert("RGB")
            preds = self.classifier(img, top_k=3)
            # Preds: list of {label, score}
            top = preds[0]
            top_conf = float(top.get("score", 0.0))
            # Heuristic: high confidence in a single natural class -> likely genuine
            # Map to fraud probability: 1 - top_conf
            return max(0.0, min(1.0, 1.0 - top_conf))

        return await asyncio.get_running_loop().run_in_executor(None, _classify)

    async def _check_image_metadata(self, image_bytes: bytes) -> float:
        """Check EXIF metadata for signs of editing.

        Returns fraud probability 0.0-1.0.
        """
        def _meta_check():
            try:
                img = Image.open(__import__("io").BytesIO(image_bytes))
            except Exception:
                return 0.8

            exif = getattr(img, "_getexif", lambda: None)()
            if not exif:
                # No EXIF is a mild red flag
                return 0.6

            # Map EXIF tags to names
            mapped = {}
            for k, v in exif.items():
                name = ExifTags.TAGS.get(k, k)
                mapped[name] = v

            score = 0.0
            software = str(mapped.get("Software", "")).lower()
            if any(x in software for x in ("photoshop", "gimp", "paint", "affinity")):
                score += 0.9

            # creation vs. modification
            date_str = mapped.get("DateTime") or mapped.get("DateTimeOriginal")
            if date_str:
                # Presence of creation date reduces suspicion
                score += 0.0
            # GPS suspiciousness
            if mapped.get("GPSInfo"):
                # presence of GPS is unusual for scanned certificates
                score += 0.2

            return min(1.0, score)

        return await asyncio.get_running_loop().run_in_executor(None, _meta_check)

    async def _detect_visual_anomalies(self, image_bytes: bytes) -> float:
        """Detect copy-paste regions, noise inconsistency, and color discontinuities.

        Returns fraud probability 0.0-1.0.
        """
        def _visual_check():
            try:
                img = Image.open(__import__("io").BytesIO(image_bytes)).convert("RGB")
            except Exception:
                return 0.9

            arr = np.array(img)
            h, w = arr.shape[:2]

            # 1) Simple copy-move approximation: check duplicated 32x32 blocks
            block = 32
            hashes = {}
            dup_count = 0
            total = 0
            for y in range(0, h - block + 1, block):
                for x in range(0, w - block + 1, block):
                    total += 1
                    patch = arr[y : y + block, x : x + block]
                    hsh = hashlib.sha256(patch.tobytes()).hexdigest()
                    if hsh in hashes:
                        dup_count += 1
                    else:
                        hashes[hsh] = 1
            dup_ratio = dup_count / max(1, total)

            # 2) Noise inconsistency: compare local stddev vs global
            gray = np.mean(arr, axis=2)
            local_std = np.std(gray)
            blurred = np.array(img.filter(ImageFilter.GaussianBlur(radius=3)).convert("L"))
            diff = np.abs(gray - blurred)
            diff_std = np.std(diff)

            # 3) Color histogram discontinuity across quadrants
            q_scores = []
            qs = [
                arr[0 : h // 2, 0 : w // 2],
                arr[0 : h // 2, w // 2 : w],
                arr[h // 2 : h, 0 : w // 2],
                arr[h // 2 : h, w // 2 : w],
            ]
            for q in qs:
                q_hist = np.histogram(q.flatten(), bins=16)[0].astype(float)
                q_hist /= (q_hist.sum() + 1e-6)
                q_scores.append(q_hist)
            # pairwise l1 distances
            dists = []
            for i in range(len(q_scores)):
                for j in range(i + 1, len(q_scores)):
                    dists.append(np.sum(np.abs(q_scores[i] - q_scores[j])))
            color_discontinuity = float(np.mean(dists))

            # Combine heuristics into a fraud-like score
            score = 0.0
            score += min(1.0, dup_ratio * 5.0) * 0.5
            score += min(1.0, (diff_std / (local_std + 1e-6))) * 0.3
            score += min(1.0, color_discontinuity * 2.0) * 0.2

            return min(1.0, score)

        return await asyncio.get_running_loop().run_in_executor(None, _visual_check)

    async def _analyze_text_regions(self, image_bytes: bytes) -> float:
        """Analyze text-like regions for rotation, background inconsistency, spacing anomalies.

        Returns fraud probability 0.0-1.0.
        """
        def _text_check():
            try:
                img = Image.open(__import__("io").BytesIO(image_bytes)).convert("L")
            except Exception:
                return 0.8

            # Edge detection to approximate text areas
            edges = img.filter(ImageFilter.FIND_EDGES)
            arr = np.array(edges)
            h, w = arr.shape

            # Threshold to binary
            thresh = (arr.mean() + arr.std())
            binmask = (arr > thresh).astype(np.uint8)

            # Projective density along horizontal axis to find lines
            hor_proj = binmask.sum(axis=1)
            peaks = (hor_proj > (hor_proj.mean() + hor_proj.std())).sum()

            # If few peaks, likely no text -> suspicious
            score = 0.0
            if peaks < 3:
                score += 0.6

            # Check for uneven spacing: variance of run-lengths in a middle row
            mid = binmask[h // 2]
            runs = []
            run = 0
            for v in mid:
                if v:
                    run += 1
                elif run:
                    runs.append(run)
                    run = 0
            if run:
                runs.append(run)

            if runs:
                rvar = float(np.std(runs) / (np.mean(runs) + 1e-6))
                if rvar > 1.0:
                    score += 0.4

            return min(1.0, score)

        return await asyncio.get_running_loop().run_in_executor(None, _text_check)

    def _get_verdict(self, score: float) -> str:
        if score < 0.30:
            return "GENUINE"
        elif score < 0.65:
            return "SUSPICIOUS"
        else:
            return "FAKE"

    def _get_verdict_label(self, score: float) -> str:
        if score < 0.30:
            return "Certificate appears authentic"
        elif score < 0.65:
            return "Certificate requires manual review"
        else:
            return "High probability of tampering detected"

    def _get_recommendation(self, score: float) -> str:
        if score < 0.30:
            return "Safe to proceed with verification via QR code"
        elif score < 0.65:
            return "Request original certificate from issuing institution"
        else:
            return "Do not accept. Report to SkillChain admin immediately."


fraud_detection_service = FraudDetectionService()


def load_classifier_once():
    """Module-level helper used by startup to pre-warm model weights."""
    fraud_detection_service.load_classifier_once()

"""
Certificate image screening using a Vision Transformer classifier.

The public model is not trained on forged certificates; this is a demo hook
where we use the top prediction confidence as a simple anomaly-style score.
"""

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
