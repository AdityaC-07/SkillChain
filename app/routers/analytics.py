from datetime import datetime, timedelta
from typing import List

from fastapi import APIRouter, Depends
from bson import ObjectId

from app.core.database import get_client
from app.models.certificate import Certificate
from app.models.audit_log import AuditLog
from app.models.fraud_alert import FraudAlert
from app.middleware.auth_middleware import get_current_user
from app.middleware.role_guard import require_roles
from app.models.user import User

router = APIRouter(prefix="/api/analytics", tags=["analytics"]) 

# Simple in-process TTL cache
_cache: dict = {}

def _cache_get(key: str):
    item = _cache.get(key)
    if not item:
        return None
    expires, val = item
    if datetime.utcnow() > expires:
        del _cache[key]
        return None
    return val

def _cache_set(key: str, val, ttl: int = 60):
    _cache[key] = (datetime.utcnow() + timedelta(seconds=ttl), val)


@router.get("/stats")
async def stats():
    cached = _cache_get("landing_stats")
    if cached:
        return {"success": True, "data": cached}

    db = get_client().get_default_database()
    cert_coll = db.get_collection("certificates")
    audit_coll = db.get_collection("audit_logs")
    fraud_coll = db.get_collection("fraud_alerts")

    # total certificates
    total_certificates = await cert_coll.count_documents({})

    # verified today
    today = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
    pipeline_verified = [
        {"$match": {"action": "VERIFIED", "timestamp": {"$gte": today}}},
        {"$count": "count"},
    ]
    cur = audit_coll.aggregate(pipeline_verified)
    verified_today_doc = await cur.to_list(length=1)
    verified_today = verified_today_doc[0]["count"] if verified_today_doc else 0

    fraud_scans_total = await fraud_coll.count_documents({})
    fake_detected = await fraud_coll.count_documents({"verdict": "FAKE"})

    # distinct institutes
    pipeline_institutes = [
        {"$group": {"_id": "$institution_name"}},
        {"$count": "count"}
    ]
    cur2 = cert_coll.aggregate(pipeline_institutes)
    inst_doc = await cur2.to_list(length=1)
    institutes_active = inst_doc[0]["count"] if inst_doc else 0

    # certificates this month
    start_month = datetime.utcnow().replace(day=1, hour=0, minute=0, second=0, microsecond=0)
    certificates_this_month = await cert_coll.count_documents({"issued_at": {"$gte": start_month}})

    result = {
        "total_certificates_issued": total_certificates,
        "verified_today": verified_today,
        "fraud_scans_total": fraud_scans_total,
        "fake_detected": fake_detected,
        "institutes_active": institutes_active,
        "certificates_this_month": certificates_this_month,
    }

    _cache_set("landing_stats", result, ttl=60)
    return {"success": True, "data": result}


@router.get("/dashboard")
async def dashboard(user: User = Depends(require_roles("institute"))):
    # institute-specific analytics
    db = get_client().get_default_database()
    cert_coll = db.get_collection("certificates")
    audit_coll = db.get_collection("audit_logs")

    user_oid = ObjectId(str(user.id))

    # my_stats
    match_my = {"issued_by.$id": user_oid}
    total_issued = await cert_coll.count_documents(match_my)
    revoked = await cert_coll.count_documents({**match_my, "status": "REVOKED"})
    active = total_issued - revoked

    # verified today for this institute
    today = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
    pipeline_verified_my = [
        {"$match": {"action": "VERIFIED", "timestamp": {"$gte": today}, "metadata.institution_id": {"$eq": user_oid}}},
        {"$count": "count"}
    ]
    cur = audit_coll.aggregate(pipeline_verified_my)
    vdoc = await cur.to_list(length=1)
    verified_today = vdoc[0]["count"] if vdoc else 0

    my_stats = {"total_issued": total_issued, "active": active, "revoked": revoked, "verified_today": verified_today}

    # monthly_issuance - last 6 months
    six_months_ago = datetime.utcnow() - timedelta(days=180)
    pipeline_monthly = [
        {"$match": {"issued_at": {"$gte": six_months_ago}, "issued_by.$id": user_oid}},
        {"$group": {"_id": {"year": {"$year": "$issued_at"}, "month": {"$month": "$issued_at"}}, "count": {"$sum": 1}}},
        {"$sort": {"_id.year": 1, "_id.month": 1}},
    ]
    curm = cert_coll.aggregate(pipeline_monthly)
    months = await curm.to_list(length=12)
    monthly_issuance = []
    for m in months:
        ym = m["_id"]
        month_str = f"{ym['month']:02d}/{ym['year']}"
        monthly_issuance.append({"month": month_str, "count": m["count"]})

    # grade distribution
    pipeline_grades = [
        {"$match": {"issued_by.$id": user_oid}},
        {"$group": {"_id": "$grade", "count": {"$sum": 1}}}
    ]
    curg = cert_coll.aggregate(pipeline_grades)
    grades = await curg.to_list(length=10)
    grade_distribution = {g["_id"]: g["count"] for g in grades}

    # top courses
    pipeline_courses = [
        {"$match": {"issued_by.$id": user_oid}},
        {"$group": {"_id": "$course_name", "count": {"$sum": 1}}},
        {"$sort": {"count": -1}},
        {"$limit": 10}
    ]
    curc = cert_coll.aggregate(pipeline_courses)
    top_courses_docs = await curc.to_list(length=10)
    top_courses = [{"course": d["_id"], "count": d["count"]} for d in top_courses_docs]

    # recent activity - last 10 audit logs for this institute
    pipeline_recent = [
        {"$match": {"metadata.institution_id": {"$eq": user_oid}}},
        {"$sort": {"timestamp": -1}},
        {"$limit": 10},
        {"$project": {"action": 1, "certificate_id": 1, "timestamp": 1, "metadata": 1}}
    ]
    recc = audit_coll.aggregate(pipeline_recent)
    recent_activity = await recc.to_list(length=10)

    return {"success": True, "data": {
        "my_stats": my_stats,
        "monthly_issuance": monthly_issuance,
        "grade_distribution": grade_distribution,
        "top_courses": top_courses,
        "recent_activity": recent_activity,
    }}


@router.get("/learner")
async def learner_stats(user: User = Depends(require_roles("learner"))):
    # learner-specific
    db = get_client().get_default_database()
    cert_coll = db.get_collection("certificates")
    audit_coll = db.get_collection("audit_logs")
    sync_coll = db.get_collection("digilocker_sync")

    # total credentials
    my_certs = await cert_coll.count_documents({"learner_email": user.email})

    # courses completed
    pipeline_courses = [
        {"$match": {"learner_email": user.email}},
        {"$group": {"_id": "$course_name"}},
    ]
    cur = cert_coll.aggregate(pipeline_courses)
    courses = [d["_id"] for d in await cur.to_list(length=100)]

    # latest certificate
    latest = await cert_coll.find({"learner_email": user.email}).sort("issued_at", -1).limit(1).to_list(length=1)
    latest_cert = latest[0] if latest else None

    digilocker_synced = await sync_coll.count_documents({"learner_aadhaar_last4": {"$exists": True}, "certificate_id": {"$in": [c.get("certificate_id") for c in await cert_coll.find({"learner_email": user.email}).to_list(length=1000)]}})

    # share_count approximated as VERIFIED audit logs for user's certificates
    cert_ids = [c.get("certificate_id") for c in await cert_coll.find({"learner_email": user.email}).to_list(length=1000)]
    share_count = 0
    if cert_ids:
        share_count = await audit_coll.count_documents({"action": "VERIFIED", "certificate_id": {"$in": cert_ids}})

    return {"success": True, "data": {
        "total_credentials": my_certs,
        "courses_completed": courses,
        "latest_certificate": latest_cert,
        "digilocker_synced": digilocker_synced,
        "share_count": share_count,
    }}
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
