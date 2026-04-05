"""Fraud scan API response."""

from typing import Literal

from pydantic import BaseModel


class FraudScanResponse(BaseModel):
    fraud_score: float
    verdict: Literal["GENUINE", "SUSPICIOUS", "FAKE"]
    confidence: float
    details: str
