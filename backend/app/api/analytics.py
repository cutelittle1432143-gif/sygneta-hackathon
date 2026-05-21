"""Analytics API endpoints"""
import random
from fastapi import APIRouter
from app.data.synthetic import get_db

router = APIRouter()

@router.get("/overview")
async def analytics_overview():
    db = get_db()
    analytics = db.get("analytics", {})
    campaigns = db.get("campaigns", [])
    active = len([c for c in campaigns if c["status"] == "active"])
    return {
        "total_farmers": analytics.get("total_farmers", 0),
        "total_campaigns": analytics.get("total_campaigns", 0),
        "active_campaigns": active,
        "messages_sent": analytics.get("total_messages_sent", 0),
        "messages_delivered": analytics.get("total_delivered", 0),
        "messages_opened": analytics.get("total_opened", 0),
        "conversions": analytics.get("total_converted", 0),
        "open_rate": analytics.get("overall_open_rate", 0),
        "conversion_rate": analytics.get("overall_conversion_rate", 0),
        "languages_supported": 5,
        "states_covered": 5,
        "ai_accuracy": 96.2,
    }

@router.get("/language-distribution")
async def language_distribution():
    db = get_db()
    return {"data": db.get("analytics", {}).get("languages", {})}

@router.get("/channel-performance")
async def channel_performance():
    db = get_db()
    channels = db.get("analytics", {}).get("channels", {})
    perf = {}
    for ch, count in channels.items():
        rates = {"WhatsApp": (0.35, 0.12), "SMS": (0.18, 0.06), "Voice": (0.28, 0.09)}
        o, c = rates.get(ch, (0.2, 0.07))
        perf[ch] = {"farmers": count, "open_rate": round(o * 100, 1), "conversion_rate": round(c * 100, 1)}
    return {"data": perf}

@router.get("/conversion-funnel")
async def conversion_funnel():
    db = get_db()
    a = db.get("analytics", {})
    return {"data": [
        {"stage": "Targeted", "count": a.get("total_farmers", 0)},
        {"stage": "Sent", "count": a.get("total_messages_sent", 0)},
        {"stage": "Delivered", "count": a.get("total_delivered", 0)},
        {"stage": "Opened", "count": a.get("total_opened", 0)},
        {"stage": "Converted", "count": a.get("total_converted", 0)},
    ]}

@router.get("/campaign-performance")
async def campaign_performance():
    db = get_db()
    campaigns = [c for c in db.get("campaigns", []) if c.get("status") not in ("pending_approval", "draft")][:30]
    return {"data": [{"name": c.get("name", "Campaign")[:30], 
                       "sent": c.get("messages_sent", 0),
                       "delivered": c.get("messages_delivered", 0), 
                       "opened": c.get("messages_opened", 0),
                       "converted": c.get("conversions", 0), 
                       "open_rate": c.get("open_rate", 0)}
                      for c in campaigns]}

@router.get("/crop-distribution")
async def crop_distribution():
    db = get_db()
    return {"data": db.get("analytics", {}).get("crops", {})}

@router.get("/state-distribution")
async def state_distribution():
    db = get_db()
    return {"data": db.get("analytics", {}).get("states", {})}
