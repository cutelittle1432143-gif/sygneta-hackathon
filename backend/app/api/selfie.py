"""KrishiGarv Selfie Tool API"""
import os
import uuid
from fastapi import APIRouter, UploadFile, File, Form
from fastapi.responses import FileResponse
from typing import Optional

router = APIRouter()

# Crop detection responses (demo mode - no ML model needed)
CROP_DETECTIONS = {
    "rice": {"crop": "Rice", "confidence": 0.89, "emoji": "🌾", "color": "#4CAF50"},
    "cotton": {"crop": "Cotton", "confidence": 0.85, "emoji": "🌿", "color": "#FFFFFF"},
    "wheat": {"crop": "Wheat", "confidence": 0.87, "emoji": "🌾", "color": "#FFD700"},
}

FRAME_TEMPLATES = [
    {"id": "rice_care", "name": "Syngenta Rice Care", "crop": "Rice",
     "tagline_en": "Protecting India's Rice Heritage", "tagline_hi": "भारत की धान विरासत की रक्षा",
     "tagline_te": "భారతదేశ వరి వారసత్వాన్ని రక్షించడం", "tagline_ta": "இந்தியாவின் நெல் பாரம்பரியத்தைப் பாதுகாத்தல்",
     "bg_color": "#1B5E20", "accent": "#4CAF50"},
    {"id": "cotton_expert", "name": "Cotton Protection Expert", "crop": "Cotton",
     "tagline_en": "White Gold, Protected", "tagline_hi": "सफ़ेद सोना, सुरक्षित",
     "tagline_te": "తెల్ల బంగారం, రక్షించబడింది", "tagline_ta": "வெள்ளை தங்கம், பாதுகாக்கப்பட்டது",
     "bg_color": "#1A237E", "accent": "#5C6BC0"},
    {"id": "wheat_champion", "name": "Wheat Harvest Champion", "crop": "Wheat",
     "tagline_en": "Golden Harvest, Every Season", "tagline_hi": "सुनहरी फसल, हर मौसम",
     "tagline_te": "బంగారు పంట, ప్రతి సీజన్", "tagline_ta": "தங்க அறுவடை, ஒவ்வொரு பருவமும்",
     "bg_color": "#E65100", "accent": "#FF9800"},
]

@router.get("/frames")
async def get_frames():
    """Get available branded frame templates."""
    return {"frames": FRAME_TEMPLATES}

@router.post("/detect-crop")
async def detect_crop(file: UploadFile = File(...)):
    """Detect crop from uploaded image (demo mode)."""
    import random
    crop = random.choice(list(CROP_DETECTIONS.values()))
    return {
        "detected": True,
        "crop": crop["crop"],
        "confidence": crop["confidence"],
        "emoji": crop["emoji"],
        "message": f"Detected: {crop['crop']} {crop['emoji']} ({int(crop['confidence']*100)}% confidence)"
    }

@router.post("/generate")
async def generate_selfie(
    file: UploadFile = File(...),
    crop: str = Form("Rice"),
    product: str = Form("Amistar Top"),
    frame: str = Form("rice_care"),
    farmer_name: str = Form("Farmer"),
    language: str = Form("English")
):
    """Generate branded KrishiGarv selfie image."""
    try:
        from PIL import Image, ImageDraw, ImageFont
        import io

        # Read uploaded image
        contents = await file.read()
        img = Image.open(io.BytesIO(contents)).convert("RGBA")
        img = img.resize((600, 600))

        # Create branded frame
        canvas = Image.new("RGBA", (700, 900), (0, 0, 0, 0))
        
        # Find frame template
        template = next((f for f in FRAME_TEMPLATES if f["id"] == frame), FRAME_TEMPLATES[0])
        
        # Draw background
        draw = ImageDraw.Draw(canvas)
        bg_color = template["bg_color"]
        r, g, b = int(bg_color[1:3], 16), int(bg_color[3:5], 16), int(bg_color[5:7], 16)
        draw.rectangle([(0, 0), (700, 900)], fill=(r, g, b, 255))
        
        # Draw accent bar top
        accent = template["accent"]
        ar, ag, ab = int(accent[1:3], 16), int(accent[3:5], 16), int(accent[5:7], 16)
        draw.rectangle([(0, 0), (700, 80)], fill=(ar, ag, ab, 255))
        
        # Draw accent bar bottom
        draw.rectangle([(0, 770), (700, 900)], fill=(ar, ag, ab, 255))
        
        # Place farmer photo (centered)
        photo_size = 500
        img_resized = img.resize((photo_size, photo_size))
        canvas.paste(img_resized, (100, 100))
        
        # Add text overlays
        try:
            font_large = ImageFont.truetype("arial.ttf", 28)
            font_medium = ImageFont.truetype("arial.ttf", 22)
            font_small = ImageFont.truetype("arial.ttf", 18)
        except:
            font_large = ImageFont.load_default()
            font_medium = font_large
            font_small = font_large

        # Top bar text
        draw.text((20, 20), "🌾 KrishiGarv", fill="white", font=font_large)
        draw.text((450, 25), "SYNGENTA", fill="white", font=font_medium)
        
        # Bottom text
        draw.text((20, 640), f"👤 {farmer_name}", fill="white", font=font_medium)
        draw.text((20, 670), f"🌱 {crop} | {product}", fill="white", font=font_small)
        
        tagline_key = f"tagline_{'hi' if language == 'Hindi' else 'te' if language == 'Telugu' else 'ta' if language == 'Tamil' else 'en'}"
        tagline = template.get(tagline_key, template["tagline_en"])
        draw.text((20, 790), template["name"], fill="white", font=font_large)
        draw.text((20, 830), tagline, fill=(255, 255, 255, 200), font=font_small)
        draw.text((20, 860), "#KrishiGarv #SyngentaCares", fill=(255, 255, 255, 150), font=font_small)

        # Save
        output_id = str(uuid.uuid4())[:8]
        output_path = f"static/selfies/krishigarv_{output_id}.png"
        canvas.save(output_path, "PNG")

        return {
            "success": True,
            "image_url": f"/static/selfies/krishigarv_{output_id}.png",
            "farmer_name": farmer_name,
            "crop": crop,
            "product": product,
            "frame": template["name"],
        }
    except ImportError:
        return {
            "success": True,
            "image_url": "/static/selfies/demo_krishigarv.png",
            "farmer_name": farmer_name,
            "crop": crop,
            "product": product,
            "frame": frame,
            "note": "Demo mode - Pillow not installed"
        }
    except Exception as e:
        return {"success": False, "error": str(e)}
