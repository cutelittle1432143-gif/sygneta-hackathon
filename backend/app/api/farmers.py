"""Farmer management API endpoints"""
from fastapi import APIRouter, HTTPException
from typing import Optional
from app.data.synthetic import get_db

router = APIRouter()

@router.get("/")
async def list_farmers(state: Optional[str] = None, crop: Optional[str] = None,
                       language: Optional[str] = None, limit: int = 50, offset: int = 0):
    db = get_db()
    farmers = db.get("farmers", [])
    if state:
        farmers = [f for f in farmers if f["state"] == state]
    if crop:
        farmers = [f for f in farmers if f["crop"] == crop]
    if language:
        farmers = [f for f in farmers if f["language"] == language]
    total = len(farmers)
    return {"farmers": farmers[offset:offset + limit], "total": total}

@router.get("/stats")
async def farmer_stats():
    db = get_db()
    farmers = db.get("farmers", [])
    states = {}
    crops = {}
    languages = {}
    channels = {}
    for f in farmers:
        states[f["state"]] = states.get(f["state"], 0) + 1
        crops[f["crop"]] = crops.get(f["crop"], 0) + 1
        languages[f["language"]] = languages.get(f["language"], 0) + 1
        channels[f["channel_preference"]] = channels.get(f["channel_preference"], 0) + 1
    return {"total": len(farmers), "by_state": states, "by_crop": crops,
            "by_language": languages, "by_channel": channels}

@router.get("/{farmer_id}")
async def get_farmer(farmer_id: str):
    db = get_db()
    for f in db.get("farmers", []):
        if f["id"] == farmer_id:
            return f
    raise HTTPException(404, "Farmer not found")
