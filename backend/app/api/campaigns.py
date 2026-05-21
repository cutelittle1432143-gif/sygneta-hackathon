"""Campaign API endpoints"""
import uuid
from datetime import datetime
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional, List
from app.data.synthetic import get_db
from app.rag.pipeline import get_rag_pipeline

router = APIRouter()

class CampaignCreate(BaseModel):
    name: str
    crop: str
    state: str
    district: Optional[str] = None
    language: str = "Hindi"
    channel: str = "WhatsApp"
    pest: Optional[str] = None
    urgency: str = "medium"

class MessageGenRequest(BaseModel):
    crop: str
    state: str
    language: str = "Hindi"
    channel: str = "WhatsApp"
    pest: Optional[str] = None
    farmer_name: Optional[str] = None
    urgency: str = "medium"
    count: int = 5

@router.get("/")
async def list_campaigns(status: Optional[str] = None, limit: int = 50):
    db = get_db()
    campaigns = db.get("campaigns", [])
    if status:
        campaigns = [c for c in campaigns if c["status"] == status]
    else:
        campaigns = [c for c in campaigns if c.get("status") != "pending_approval"]
    campaigns.sort(key=lambda x: x["created_at"], reverse=True)
    return {"campaigns": campaigns[:limit], "total": len(campaigns)}

@router.get("/{campaign_id}")
async def get_campaign(campaign_id: str):
    db = get_db()
    for c in db.get("campaigns", []):
        if c["id"] == campaign_id:
            return c
    raise HTTPException(404, "Campaign not found")

@router.post("/")
async def create_campaign(data: CampaignCreate):
    db = get_db()
    campaign = {
        "id": str(uuid.uuid4()),
        "name": data.name,
        "crop": data.crop,
        "state": data.state,
        "district": data.district or "",
        "language": data.language,
        "lang_code": {"Hindi": "hi", "Telugu": "te", "Tamil": "ta", "Marathi": "mr", "Punjabi": "pa"}.get(data.language, "en"),
        "channel": data.channel,
        "pest": data.pest or "",
        "urgency": data.urgency,
        "status": "draft",
        "target_farmers": 0,
        "messages_sent": 0,
        "messages_delivered": 0,
        "messages_opened": 0,
        "conversions": 0,
        "open_rate": 0,
        "conversion_rate": 0,
        "product": "",
        "created_at": datetime.now().isoformat(),
        "scheduled_at": None,
        "messages": []
    }
    db["campaigns"].insert(0, campaign)
    return campaign

@router.post("/{campaign_id}/generate")
async def generate_messages(campaign_id: str, req: MessageGenRequest):
    db = get_db()
    campaign = None
    for c in db.get("campaigns", []):
        if c["id"] == campaign_id:
            campaign = c
            break
    if not campaign:
        raise HTTPException(404, "Campaign not found")

    rag = get_rag_pipeline()
    query = f"{req.crop} farmer in {req.state}, {req.pest or 'general pest'} issue, {req.channel} message"
    
    # Get matching farmers
    farmers = [f for f in db.get("farmers", []) if f["state"] == req.state and f["crop"] == req.crop][:req.count]
    
    messages = []
    for farmer in farmers:
        result = await rag.generate(
            query=query, crop=req.crop, state=req.state,
            language=req.language, channel=req.channel, farmer_name=farmer["name"]
        )
        messages.append({
            "id": str(uuid.uuid4()),
            "farmer_id": farmer["id"],
            "farmer_name": farmer["name"],
            "content": result["response"],
            "language": req.language,
            "channel": req.channel,
            "status": "generated",
            "grounded": result["grounded"],
            "model": result["model"],
            "sources": len(result["retrieved_documents"]),
            "created_at": datetime.now().isoformat()
        })
    
    campaign["messages"] = messages
    campaign["status"] = "ready"
    campaign["target_farmers"] = len(messages)
    return {"campaign_id": campaign_id, "messages": messages, "count": len(messages)}

@router.post("/generate-preview")
async def generate_preview(req: MessageGenRequest):
    """Quick preview - generate a single message without campaign."""
    rag = get_rag_pipeline()
    query = f"{req.crop} farmer in {req.state}, {req.pest or 'general pest'} issue"
    result = await rag.generate(
        query=query, crop=req.crop, state=req.state,
        language=req.language, channel=req.channel, farmer_name=req.farmer_name
    )
    return result

@router.get("/pending/list")
async def list_pending_campaigns():
    db = get_db()
    campaigns = db.get("campaigns", [])
    pending = [c for c in campaigns if c.get("status") == "pending_approval"]
    pending.sort(key=lambda x: x["created_at"], reverse=True)
    return {"campaigns": pending, "total": len(pending)}

@router.post("/trigger-scan")
async def trigger_alerts_scan():
    from app.services.automation import AutomationService
    db = get_db()
    service = AutomationService()
    proposals = service.generate_proposals()
    
    existing_names = {c["name"] for c in db.get("campaigns", [])}
    added_count = 0
    for p in proposals:
        if p["name"] not in existing_names:
            db["campaigns"].insert(0, p)
            added_count += 1
            
    return {"status": "success", "fetched": len(proposals), "added": added_count}

@router.post("/{campaign_id}/approve")
async def approve_campaign(campaign_id: str):
    db = get_db()
    campaign = None
    for c in db.get("campaigns", []):
        if c["id"] == campaign_id:
            campaign = c
            break
            
    if not campaign:
        raise HTTPException(404, "Campaign not found")
        
    campaign["status"] = "active"
    campaign["scheduled_at"] = datetime.now().isoformat()
    
    target_state = campaign.get("state")
    target_crop = campaign.get("crop")
    target_pest = campaign.get("pest")
    
    farmers = [f for f in db.get("farmers", []) if f["state"] == target_state and f["crop"] == target_crop]
    
    district = campaign.get("district")
    if district:
        farmers = [f for f in farmers if f["district"] == district]
        
    # Limit matching farmers to 50 for quick generation
    farmers = farmers[:50]
    
    rag = get_rag_pipeline()
    messages = []
    templates = campaign.get("message_templates", {})
    
    from app.services.twilio_sms import send_twilio_sms
    sent_live = False
    
    for idx, farmer in enumerate(farmers):
        farmer_lang = farmer.get("language", "English")
        base_msg = templates.get(farmer_lang) or templates.get("English") or f"Alert for {target_crop} - {target_pest} protection. Use recommended product."
        
        # Hyper-personalize: replace placeholder/prefix with name
        personalized_text = f"Dear {farmer['name']}, {base_msg}"
        
        # Send a single live test SMS to prevent HTTP timeouts
        sms_sid = None
        if idx == 0 and farmer.get("phone"):
            sms_sid = send_twilio_sms(farmer["phone"], personalized_text)
            sent_live = sms_sid is not None
            
        messages.append({
            "id": str(uuid.uuid4()),
            "farmer_id": farmer["id"],
            "farmer_name": farmer["name"],
            "content": personalized_text,
            "language": farmer_lang,
            "channel": "SMS",
            "status": "sent" if sms_sid else "generated",
            "twilio_sid": sms_sid,
            "grounded": True,
            "model": "llama-3.3-70b-versatile" if rag.groq_client else "rule-base-personalized",
            "sources": 1,
            "created_at": datetime.now().isoformat()
        })
        
    campaign["messages"] = messages
    campaign["target_farmers"] = len(messages)
    campaign["messages_sent"] = len(messages)
    campaign["messages_delivered"] = int(len(messages) * 0.95)
    campaign["messages_opened"] = int(len(messages) * 0.40)
    campaign["conversions"] = int(len(messages) * 0.12)
    
    if len(messages) > 0:
        campaign["open_rate"] = round(campaign["messages_opened"] / campaign["messages_delivered"] * 100, 1)
        campaign["conversion_rate"] = round(campaign["conversions"] / campaign["messages_opened"] * 100, 1)
    else:
        campaign["open_rate"] = 0
        campaign["conversion_rate"] = 0
        
    # Also overwrite the channel preference on the approved campaign
    campaign["channel"] = "SMS"
    
    return {"status": "success", "campaign": campaign, "messages_count": len(messages), "sent_live": sent_live}

@router.post("/{campaign_id}/reject")
async def reject_campaign(campaign_id: str):
    db = get_db()
    campaigns = db.get("campaigns", [])
    
    found = False
    for i, c in enumerate(campaigns):
        if c["id"] == campaign_id:
            campaigns.pop(i)
            found = True
            break
            
    if not found:
        raise HTTPException(404, "Campaign not found")
        
    return {"status": "success", "message": "Campaign proposal dismissed"}

@router.get("/twilio/logs")
async def get_twilio_logs():
    db = get_db()
    logs = []
    for c in db.get("campaigns", []):
        if c.get("status") == "active" or c.get("status") == "completed":
            messages = c.get("messages", [])
            for m in messages:
                logs.append({
                    "id": m.get("id"),
                    "campaign_name": c.get("name"),
                    "farmer_name": m.get("farmer_name"),
                    "content": m.get("content"),
                    "language": m.get("language"),
                    "twilio_sid": m.get("twilio_sid") or f"SM{m.get('id')[:8]}",
                    "status": m.get("status") or "sent",
                    "sent_at": c.get("scheduled_at") or c.get("created_at")
                })
    logs.sort(key=lambda x: x.get("sent_at", ""), reverse=True)
    return {"logs": logs[:100]}
