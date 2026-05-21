"""
Synthetic Data Generator for Bhoomi AI
Generates 1000 farmers, 500 campaigns, 100 pest scenarios
"""
import random
import uuid
from datetime import datetime, timedelta

# In-memory database (for MVP - no external DB dependency)
_db = {
    "farmers": [],
    "campaigns": [],
    "pest_scenarios": [],
    "messages": [],
    "analytics": {}
}

def get_db():
    return _db

# ── Reference Data ──────────────────────────────────────────────────
STATES = {
    "Andhra Pradesh": {
        "districts": ["Guntur", "Krishna", "East Godavari", "West Godavari", "Prakasam",
                       "Nellore", "Kurnool", "Visakhapatnam", "Srikakulam", "Chittoor"],
        "language": "Telugu",
        "crops": ["Rice", "Cotton", "Sugarcane", "Groundnut", "Chili"],
        "lang_code": "te"
    },
    "Maharashtra": {
        "districts": ["Nagpur", "Amravati", "Yavatmal", "Akola", "Wardha",
                       "Jalna", "Aurangabad", "Nashik", "Pune", "Kolhapur"],
        "language": "Marathi",
        "crops": ["Cotton", "Sugarcane", "Soybean", "Wheat", "Grape"],
        "lang_code": "mr"
    },
    "Tamil Nadu": {
        "districts": ["Thanjavur", "Tiruvarur", "Nagapattinam", "Cuddalore", "Villupuram",
                       "Kanchipuram", "Tiruvallur", "Coimbatore", "Madurai", "Trichy"],
        "language": "Tamil",
        "crops": ["Rice", "Sugarcane", "Cotton", "Groundnut", "Banana"],
        "lang_code": "ta"
    },
    "Punjab": {
        "districts": ["Ludhiana", "Amritsar", "Patiala", "Jalandhar", "Bathinda",
                       "Moga", "Sangrur", "Ferozepur", "Fazilka", "Barnala"],
        "language": "Punjabi",
        "crops": ["Wheat", "Rice", "Cotton", "Sugarcane", "Maize"],
        "lang_code": "pa"
    },
    "Uttar Pradesh": {
        "districts": ["Lucknow", "Varanasi", "Agra", "Kanpur", "Allahabad",
                       "Meerut", "Gorakhpur", "Bareilly", "Aligarh", "Moradabad"],
        "language": "Hindi",
        "crops": ["Wheat", "Rice", "Sugarcane", "Potato", "Mustard"],
        "lang_code": "hi"
    }
}

CROPS = {
    "Rice": {
        "season": "Kharif",
        "sowing": "June-July",
        "harvest": "October-November",
        "stages": ["Nursery", "Transplanting", "Tillering", "Flowering", "Grain Filling", "Harvesting"],
        "pests": ["Rice Blast", "Brown Plant Hopper", "Stem Borer", "Leaf Folder", "Sheath Blight"],
        "products": ["Amistar Top", "Actara", "Alika", "Score", "Cruiser"]
    },
    "Cotton": {
        "season": "Kharif",
        "sowing": "May-June",
        "harvest": "October-December",
        "stages": ["Germination", "Vegetative", "Squaring", "Flowering", "Boll Formation", "Picking"],
        "pests": ["Bollworm", "Whitefly", "Jassid", "Aphid", "Pink Bollworm"],
        "products": ["Ampligo", "Polo", "Actara", "Alika", "Cruiser"]
    },
    "Wheat": {
        "season": "Rabi",
        "sowing": "October-November",
        "harvest": "March-April",
        "stages": ["Germination", "Tillering", "Stem Extension", "Heading", "Grain Filling", "Ripening"],
        "pests": ["Yellow Rust", "Brown Rust", "Aphid", "Termite", "Karnal Bunt"],
        "products": ["Amistar Top", "Tilt", "Score", "Cruiser", "Actara"]
    },
    "Sugarcane": {
        "season": "Annual",
        "sowing": "February-March",
        "harvest": "December-March",
        "stages": ["Germination", "Tillering", "Grand Growth", "Maturity", "Harvesting"],
        "pests": ["Borers", "Whitefly", "Pyrilla", "Red Rot", "Smut"],
        "products": ["Actara", "Amistar", "Cruiser", "Ampligo", "Score"]
    },
    "Groundnut": {
        "season": "Kharif",
        "sowing": "June-July",
        "harvest": "October-November",
        "stages": ["Germination", "Vegetative", "Flowering", "Pegging", "Pod Development", "Maturity"],
        "pests": ["Leaf Miner", "Tikka Disease", "Collar Rot", "Aphid", "Thrips"],
        "products": ["Amistar Top", "Score", "Actara", "Cruiser", "Ridomil Gold"]
    }
}

CHANNEL_PREFS = ["WhatsApp", "SMS", "Voice"]
GROWTH_STAGES = ["Sowing", "Vegetative", "Flowering", "Fruiting", "Harvesting"]
PHONE_TYPES = ["Smartphone", "Feature Phone", "Basic Phone"]

FIRST_NAMES_MALE = ["Ramesh", "Suresh", "Rajesh", "Venkat", "Ravi", "Kumar", "Arjun", "Kiran", "Prasad", "Mohan",
                     "Srinivas", "Ganesh", "Mahesh", "Naresh", "Dinesh", "Satish", "Anil", "Vijay", "Manoj", "Santosh"]
FIRST_NAMES_FEMALE = ["Priya", "Lakshmi", "Anita", "Sunita", "Kavitha", "Padma", "Radha", "Meena", "Geetha", "Sarita",
                       "Jaya", "Rani", "Usha", "Kamala", "Sita", "Devi", "Rukmini", "Savitri", "Parvathi", "Tulsi"]

def _gen_phone():
    return f"+91{random.randint(6000000000, 9999999999)}"

def _gen_farmer(idx):
    state = random.choice(list(STATES.keys()))
    state_data = STATES[state]
    district = random.choice(state_data["districts"])
    crop = random.choice(state_data["crops"])
    gender = random.choice(["male", "female"])
    name = random.choice(FIRST_NAMES_MALE if gender == "male" else FIRST_NAMES_FEMALE)
    crop_data = CROPS.get(crop, CROPS["Rice"])

    return {
        "id": str(uuid.uuid4()),
        "name": name,
        "gender": gender,
        "age": random.randint(25, 65),
        "phone": _gen_phone(),
        "state": state,
        "district": district,
        "language": state_data["language"],
        "lang_code": state_data["lang_code"],
        "crop": crop,
        "crop_season": crop_data["season"],
        "growth_stage": random.choice(crop_data["stages"]),
        "farm_size_acres": round(random.uniform(0.5, 15.0), 1),
        "phone_type": random.choice(PHONE_TYPES),
        "channel_preference": random.choices(CHANNEL_PREFS, weights=[0.6, 0.25, 0.15])[0],
        "literacy": random.choice(["High", "Medium", "Low"]),
        "income_level": random.choice(["Low", "Medium", "High"]),
        "years_farming": random.randint(3, 40),
        "previous_purchases": random.randint(0, 10),
        "receptivity_score": round(random.uniform(0.2, 0.95), 2),
        "last_interaction": (datetime.now() - timedelta(days=random.randint(1, 90))).isoformat(),
        "created_at": datetime.now().isoformat()
    }

def _gen_campaign(idx, farmers):
    state = random.choice(list(STATES.keys()))
    state_data = STATES[state]
    crop = random.choice(state_data["crops"])
    crop_data = CROPS.get(crop, CROPS["Rice"])
    pest = random.choice(crop_data["pests"])
    product = random.choice(crop_data["products"])
    target_count = random.randint(50, 500)
    sent = int(target_count * random.uniform(0.85, 1.0))
    delivered = int(sent * random.uniform(0.80, 0.95))
    opened = int(delivered * random.uniform(0.15, 0.45))
    converted = int(opened * random.uniform(0.05, 0.25))

    return {
        "id": str(uuid.uuid4()),
        "name": f"{crop} {pest} Alert - {district}" if (district := random.choice(state_data["districts"])) else f"{crop} Campaign",
        "crop": crop,
        "pest": pest,
        "product": product,
        "state": state,
        "district": district,
        "language": state_data["language"],
        "lang_code": state_data["lang_code"],
        "channel": random.choice(CHANNEL_PREFS),
        "status": random.choice(["completed", "active", "scheduled", "draft"]),
        "target_farmers": target_count,
        "messages_sent": sent,
        "messages_delivered": delivered,
        "messages_opened": opened,
        "conversions": converted,
        "open_rate": round(opened / max(delivered, 1) * 100, 1),
        "conversion_rate": round(converted / max(opened, 1) * 100, 1),
        "urgency": random.choice(["high", "medium", "low"]),
        "created_at": (datetime.now() - timedelta(days=random.randint(0, 60))).isoformat(),
        "scheduled_at": (datetime.now() + timedelta(days=random.randint(0, 7))).isoformat(),
    }

def _gen_pest_scenario(idx):
    state = random.choice(list(STATES.keys()))
    state_data = STATES[state]
    crop = random.choice(state_data["crops"])
    crop_data = CROPS.get(crop, CROPS["Rice"])
    pest = random.choice(crop_data["pests"])

    return {
        "id": str(uuid.uuid4()),
        "pest": pest,
        "crop": crop,
        "state": state,
        "district": random.choice(state_data["districts"]),
        "severity": random.choice(["High", "Medium", "Low"]),
        "confidence": round(random.uniform(0.6, 0.99), 2),
        "affected_area_acres": random.randint(10, 5000),
        "recommended_product": random.choice(crop_data["products"]),
        "action_window_days": random.randint(2, 14),
        "detection_method": random.choice(["Satellite NDVI", "Field Report", "Weather Model", "Farmer Report"]),
        "weather_trigger": random.choice(["Heavy Rain", "High Humidity", "Temperature Spike", "Drought"]),
        "created_at": datetime.now().isoformat()
    }

def seed_database():
    """Generate synthetic data for the MVP."""
    db = get_db()

    # Generate 1000 farmers
    db["farmers"] = [_gen_farmer(i) for i in range(1000)]

    # Generate 500 campaigns
    db["campaigns"] = [_gen_campaign(i, db["farmers"]) for i in range(500)]

    # Add 3 initial pending approval campaigns
    db["campaigns"].insert(0, {
        "id": "pending-bollworm-wardha",
        "name": "Cotton Bollworm Alert - Wardha",
        "crop": "Cotton",
        "pest": "Bollworm",
        "state": "Maharashtra",
        "district": "Wardha",
        "language": "Marathi",
        "channel": "WhatsApp",
        "urgency": "high",
        "status": "pending_approval",
        "trigger_news_headline": "Pink Bollworm attack reported in Cotton fields of Wardha district, Maharashtra",
        "trigger_news_url": "https://agrinews.in/bollworm-wardha",
        "trigger_weather": "Light Rain, Temperature: 28°C, Humidity: 90%",
        "message_templates": {
            "English": "Cotton Bollworm Alert: Protect your crop with Ampligo 0.4ml/liter. Spray after 5 PM.",
            "Marathi": "कापूस बोंडअळी अलर्ट: आपल्या पिकाचे संरक्षण करा. अँप्लिगो 0.4 मि.ली./लिटर संध्याकाळी 5 नंतर फवारा."
        },
        "target_farmers": len([f for f in db["farmers"] if f["state"] == "Maharashtra" and f["crop"] == "Cotton"]),
        "created_at": datetime.now().isoformat()
    })
    db["campaigns"].insert(0, {
        "id": "pending-yellowrust-ludhiana",
        "name": "Wheat Yellow Rust Alert - Ludhiana",
        "crop": "Wheat",
        "pest": "Yellow Rust",
        "state": "Punjab",
        "district": "Ludhiana",
        "language": "Punjabi",
        "channel": "WhatsApp",
        "urgency": "high",
        "status": "pending_approval",
        "trigger_news_headline": "Yellow Rust disease detected in wheat crops of Ludhiana, Punjab",
        "trigger_news_url": "https://agrinews.in/yellow-rust-ludhiana",
        "trigger_weather": "Overcast, Temperature: 18°C, Humidity: 95%",
        "message_templates": {
            "English": "Wheat Yellow Rust Alert: Spores detected. Apply Tilt 1ml/liter at first sign of disease.",
            "Punjabi": "ਕਣਕ ਪੀਲਾ ਰਤੂਆ ਅਲਰਟ: ਬਿਮਾਰੀ ਦੇ ਪਹਿਲੇ ਲੱਛਣ 'ਤੇ ਟਿਲਟ 1 ਮਿ.ਲੀ./ਲਿਟਰ ਦਾ ਛਿੜਕਾਅ ਕਰੋ।"
        },
        "target_farmers": len([f for f in db["farmers"] if f["state"] == "Punjab" and f["crop"] == "Wheat"]),
        "created_at": datetime.now().isoformat()
    })
    db["campaigns"].insert(0, {
        "id": "pending-riceblast-godavari",
        "name": "Rice Blast Prevention - West Godavari",
        "crop": "Rice",
        "pest": "Rice Blast",
        "state": "Andhra Pradesh",
        "district": "West Godavari",
        "language": "Telugu",
        "channel": "WhatsApp",
        "urgency": "high",
        "status": "pending_approval",
        "trigger_news_headline": "Rice Blast disease threat rises in West Godavari, Andhra Pradesh after recent rain",
        "trigger_news_url": "https://agrinews.in/rice-blast-godavari",
        "trigger_weather": "Scattered Rain, Temperature: 32°C, Humidity: 88%",
        "message_templates": {
            "English": "Rice Blast Threat: High humidity trigger. Spray Amistar Top 1ml/liter in early morning.",
            "Telugu": "వరి బ్లాస్ట్ హెచ్చరిక: ఉదయం పూట అమిస్టార్ టాప్ 1ml/లీటర్ పిచికారీ చేయండి."
        },
        "target_farmers": len([f for f in db["farmers"] if f["state"] == "Andhra Pradesh" and f["crop"] == "Rice"]),
        "created_at": datetime.now().isoformat()
    })

    # Generate 100 pest scenarios
    db["pest_scenarios"] = [_gen_pest_scenario(i) for i in range(100)]

    # Generate analytics summary
    total_sent = sum(c.get("messages_sent", 0) for c in db["campaigns"])
    total_delivered = sum(c.get("messages_delivered", 0) for c in db["campaigns"])
    total_opened = sum(c.get("messages_opened", 0) for c in db["campaigns"])
    total_converted = sum(c.get("conversions", 0) for c in db["campaigns"])

    db["analytics"] = {
        "total_farmers": len(db["farmers"]),
        "total_campaigns": len(db["campaigns"]),
        "total_messages_sent": total_sent,
        "total_delivered": total_delivered,
        "total_opened": total_opened,
        "total_converted": total_converted,
        "overall_open_rate": round(total_opened / max(total_delivered, 1) * 100, 1),
        "overall_conversion_rate": round(total_converted / max(total_opened, 1) * 100, 1),
        "languages": {"Telugu": 0, "Tamil": 0, "Hindi": 0, "Marathi": 0, "Punjabi": 0},
        "channels": {"WhatsApp": 0, "SMS": 0, "Voice": 0},
        "states": {},
        "crops": {}
    }

    for f in db["farmers"]:
        db["analytics"]["languages"][f["language"]] = db["analytics"]["languages"].get(f["language"], 0) + 1
        db["analytics"]["channels"][f["channel_preference"]] = db["analytics"]["channels"].get(f["channel_preference"], 0) + 1
        db["analytics"]["states"][f["state"]] = db["analytics"]["states"].get(f["state"], 0) + 1
        db["analytics"]["crops"][f["crop"]] = db["analytics"]["crops"].get(f["crop"], 0) + 1

    print(f"[OK] Seeded {len(db['farmers'])} farmers, {len(db['campaigns'])} campaigns, {len(db['pest_scenarios'])} pest scenarios")
    return db
