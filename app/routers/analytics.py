"""Aggregate stats for dashboards."""

from datetime import datetime, timezone

from fastapi import APIRouter

from app.models.audit_log import AuditLog
from app.models.certificate import Certificate

router = APIRouter(prefix="/api/analytics", tags=["analytics"])


@router.get("/stats")
async def stats():
    total_issued = await Certificate.count()

    start_day = datetime.now(timezone.utc).replace(hour=0, minute=0, second=0, microsecond=0)
    verified_today = await AuditLog.find(
        AuditLog.action == "VERIFIED",
        AuditLog.timestamp >= start_day,
    ).count()

    fraud_logs = await AuditLog.find(AuditLog.action == "FRAUD_SCAN").to_list()
    fraud_caught = sum(1 for log in fraud_logs if log.metadata.get("verdict") == "FAKE")

    pipeline = [
        {"$group": {"_id": "$course_name", "count": {"$sum": 1}}},
        {"$sort": {"count": -1}},
        {"$limit": 20},
    ]
    agg = await Certificate.aggregate(pipeline).to_list()
    certificates_by_course = [{"course": row["_id"], "count": row["count"]} for row in agg]

    recent = await AuditLog.find().sort(-AuditLog.timestamp).limit(15).to_list()
    recent_activity = [
        {
            "action": log.action,
            "certificate_id": log.certificate_id,
            "performed_by": log.performed_by,
            "timestamp": log.timestamp.isoformat(),
            "metadata": log.metadata,
        }
        for log in recent
    ]

    return {
        "total_issued": total_issued,
        "verified_today": verified_today,
        "fraud_caught": fraud_caught,
        "certificates_by_course": certificates_by_course,
        "recent_activity": recent_activity,
    }
