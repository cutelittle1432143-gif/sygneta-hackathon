"""
Agronomic Knowledge Base for RAG Pipeline
Contains Syngenta product info, pest management guides, and regional best practices.
"""

KNOWLEDGE_BASE = [
    {"id": "rice_blast_001", "crop": "Rice", "pest": "Rice Blast", "state": "all", "category": "pest_management",
     "content": """Rice Blast Disease (Magnaporthe oryzae) Management Guide:
Symptoms: Diamond-shaped lesions on leaves with gray centers and brown borders. Neck blast causes panicle breakage.
Favorable Conditions: Temperature 20-25°C, high humidity >90%, prolonged leaf wetness.
Management: Preventive: Apply Amistar Top (Azoxystrobin 18.2% + Difenoconazole 11.4% SC) at 1ml/liter at tillering stage.
Curative: Apply Score (Difenoconazole 25% EC) at 0.5ml/liter immediately on symptom appearance.
Dosage: 200 liters of spray solution per acre. Timing: Early morning or late evening. Repeat after 15 days if infection persists.
Cultural: Avoid excess nitrogen fertilization, maintain proper spacing, use resistant varieties."""},

    {"id": "rice_bph_002", "crop": "Rice", "pest": "Brown Plant Hopper", "state": "all", "category": "pest_management",
     "content": """Brown Plant Hopper (BPH) Management in Rice:
Symptoms: Yellowing at base (hopper burn), circular dead patches. Honeydew causes sooty mold.
Management: Apply Actara (Thiamethoxam 25% WG) at 0.5g/liter as foliar spray.
Alternative: Alika (Thiamethoxam 12.6% + Lambda cyhalothrin 9.5% ZC) at 0.5ml/liter.
Timing: Apply when BPH count exceeds 5-10 per hill at tillering stage.
Cultural: Drain water intermittently, avoid excess nitrogen, maintain 20x15cm spacing."""},

    {"id": "rice_stemborer_003", "crop": "Rice", "pest": "Stem Borer", "state": "all", "category": "pest_management",
     "content": """Rice Stem Borer Management:
Symptoms: Dead hearts at vegetative stage, white ears at reproductive stage.
Management: Apply Ampligo (Chlorantraniliprole 10% SC) at 0.4ml/liter at tillering.
Alternative: Cruiser (Thiamethoxam 30% FS) as seed treatment at 3ml/kg seed.
Install pheromone traps at 5/acre. Apply within 30 days of transplanting."""},

    {"id": "cotton_bollworm_004", "crop": "Cotton", "pest": "Bollworm", "state": "all", "category": "pest_management",
     "content": """Cotton Bollworm (Helicoverpa armigera) Management:
Symptoms: Circular bore holes on bolls, larval frass visible.
Management: Apply Ampligo (Chlorantraniliprole 10% SC) at 0.4ml/liter at squaring/flowering.
Alternative: Polo (Diafenthiuron 50% WP) at 1.6g/liter. 200L spray/acre.
Start monitoring from 45 DAP. Apply when 5% boll damage observed.
IPM: Release Trichogramma parasitoids at 1.5 lakh/acre at flowering."""},

    {"id": "cotton_whitefly_005", "crop": "Cotton", "pest": "Whitefly", "state": "all", "category": "pest_management",
     "content": """Cotton Whitefly Management:
Symptoms: Yellowing, sticky honeydew, sooty mold. Vector for Cotton Leaf Curl Virus.
Management: Apply Actara (Thiamethoxam 25% WG) at 0.5g/liter.
Alternative: Polo (Diafenthiuron 50% WP) at 1.6g/liter. Monitor from 15 DAP.
Apply when 5-8 adults per leaf observed. Install yellow sticky traps at 12/acre."""},

    {"id": "wheat_rust_006", "crop": "Wheat", "pest": "Yellow Rust", "state": "all", "category": "pest_management",
     "content": """Wheat Yellow Rust Management:
Symptoms: Yellow-orange stripe pustules parallel to leaf veins. Causes leaf drying and shriveled grains.
Management: Apply Amistar Top at 1ml/liter. Alternative: Tilt (Propiconazole 25% EC) at 1ml/liter.
200L spray/acre at heading stage. Grow resistant varieties (HD 3086, DBW 187), sow timely in November."""},

    {"id": "ap_rice_007", "crop": "Rice", "pest": "general", "state": "Andhra Pradesh", "category": "best_practices",
     "content": """Andhra Pradesh Rice Best Practices: Kharif (June-Nov). Districts: Guntur, Krishna, East Godavari.
Varieties: BPT 5204 (Samba Mahsuri), MTU 1010. Water: 2-5cm standing water, AWD saves 20-30%.
Fertilizer: Basal DAP 50kg/acre + MOP 30kg/acre. Top dress Urea 30kg at tillering.
Key Pest Windows: BPH Aug-Sep, Blast Jul-Aug, Stem Borer 30-45 DAT.
Syngenta: Cruiser seed treatment + Amistar Top at tillering + Actara for BPH."""},

    {"id": "mh_cotton_008", "crop": "Cotton", "pest": "general", "state": "Maharashtra", "category": "best_practices",
     "content": """Maharashtra Cotton Best Practices: Kharif. Vidarbha: Nagpur, Amravati, Yavatmal.
Bt Cotton hybrids, spacing 90x60cm. Fertilizer: 10:26:26 at 50kg/acre.
Key Pest Windows: Bollworm Aug-Oct, Whitefly Jul-Aug, Pink Bollworm Sep-Nov.
Syngenta: Ampligo for bollworm + Polo for sucking pests + Actara for whitefly."""},

    {"id": "tn_rice_009", "crop": "Rice", "pest": "general", "state": "Tamil Nadu", "category": "best_practices",
     "content": """Tamil Nadu Rice: Samba Season (Aug-Jan). Cauvery delta: Thanjavur, Tiruvarur, Nagapattinam.
SRI method: single seedling, 25x25cm, 14-day old. Saves 40% water.
Key Pest Windows: Leaf Folder Sep-Oct, BPH Oct-Nov, Blast Sep (NE monsoon onset).
Syngenta: Score for blast + Alika for BPH + leaf folder complex."""},

    {"id": "product_amistar_010", "crop": "all", "pest": "fungal", "state": "all", "category": "product",
     "content": """Syngenta Amistar Top: Azoxystrobin 18.2% + Difenoconazole 11.4% SC.
Systemic fungicide, Protective + Curative. For Rice, Wheat, Soybean.
Target: Blast, Rust, Sheath Blight, Powdery Mildew. Dose: 1ml/liter (200ml/acre).
PHI: 14 days. Rain-fast within 1 hour. Greening effect. Sizes: 100ml-1L."""},

    {"id": "product_actara_011", "crop": "all", "pest": "sucking_pest", "state": "all", "category": "product",
     "content": """Syngenta Actara: Thiamethoxam 25% WG. Systemic insecticide.
For Rice, Cotton, Sugarcane, Vegetables. Target: BPH, Whitefly, Aphids, Jassids.
Dose: 0.5g/liter (100g/acre). PHI: 14 days vegs, 21 days fruits.
Quick knockdown + 14-21 day residual. Sizes: 1g-250g."""},

    {"id": "product_ampligo_012", "crop": "all", "pest": "lepidoptera", "state": "all", "category": "product",
     "content": """Syngenta Ampligo: Chlorantraniliprole 10% SC. Anthranilic diamide.
For Cotton, Rice, Maize, Vegetables. Target: Bollworm, Stem Borer, Fruit Borer.
Dose: 0.4ml/liter (80ml/acre). PHI: 7 days.
Excellent rainfastness, 14-21 day control, safe to beneficials. Sizes: 50ml-500ml."""},
]

DEMO_RESPONSES = {
    ("Rice", "Telugu", "WhatsApp"): "🌾 నమస్కారం {name}!\n\n🔴 మీ వరి పంటలో బ్లాస్ట్ వ్యాధి గుర్తించబడింది.\n\n💊 చికిత్స: Amistar Top 1ml/లీటర్ నీటిలో కలిపి పిచికారీ చేయండి.\n⏰ సమయం: ఉదయం 7-9 గంటలు\n📏 మోతాదు: ఎకరాకు 200ml\n\n✅ 15 రోజుల తర్వాత మళ్ళీ పిచికారీ.\n📞 సహాయం: 1800-XXX-XXXX",
    ("Rice", "Tamil", "WhatsApp"): "🌾 வணக்கம் {name}!\n\n🔴 நெல் பயிரில் நோய் கண்டறியப்பட்டது.\n\n💊 சிகிச்சை: Amistar Top 1ml/லிட்டர் தண்ணீரில் தெளிக்கவும்.\n⏰ நேரம்: காலை 7-9 மணி\n📏 அளவு: ஏக்கருக்கு 200ml\n\n✅ 15 நாட்கள் பிறகு மீண்டும் தெளிக்கவும்.\n📞 உதவி: 1800-XXX-XXXX",
    ("Rice", "Hindi", "WhatsApp"): "🌾 नमस्ते {name}!\n\n🔴 धान में ब्लास्ट रोग पाया गया है।\n\n💊 उपचार: Amistar Top 1ml/लीटर पानी में छिड़काव करें।\n⏰ समय: सुबह 7-9 बजे\n📏 मात्रा: 200ml/एकड़\n\n✅ 15 दिन बाद दोबारा छिड़काव।\n📞 सहायता: 1800-XXX-XXXX",
    ("Cotton", "Hindi", "WhatsApp"): "🌿 नमस्ते {name}!\n\n🔴 कपास में बॉलवर्म का प्रकोप!\n\n💊 उपचार: Ampligo 0.4ml/लीटर छिड़काव\n⏰ समय: शाम 5 बजे बाद\n📏 मात्रा: 80ml/एकड़\n\n⚠️ फूल आने पर तुरंत उपचार करें।\n📞 सहायता: 1800-XXX-XXXX",
    ("Cotton", "Marathi", "WhatsApp"): "🌿 नमस्कार {name}!\n\n🔴 कापसावर बोंडअळीचा प्रादुर्भाव!\n\n💊 उपचार: Ampligo 0.4ml/लिटर फवारणी करा\n⏰ वेळ: सायंकाळी 5 नंतर\n📏 प्रमाण: 80ml/एकर\n\n📞 मदत: 1800-XXX-XXXX",
    ("Wheat", "Hindi", "WhatsApp"): "🌾 नमस्ते {name}!\n\n🟡 गेहूं में पीला रतुआ चेतावनी!\n\n💊 उपचार: Tilt 1ml/लीटर पानी में छिड़काव\n📏 मात्रा: 200ml/एकड़\n\n✅ 15 दिन बाद Amistar Top से दूसरा छिड़काव।\n📞 सहायता: 1800-XXX-XXXX",
}

SMS_RESPONSES = {
    "Rice": "🔴 {name}: Rice Blast Alert! Amistar Top 1ml/L NOW. 200ml/acre. Reply YES -Bhoomi",
    "Cotton": "🔴 {name}: Bollworm Alert! Ampligo 0.4ml/L. 80ml/acre. Reply YES -Bhoomi",
    "Wheat": "🟡 {name}: Rust Warning! Tilt 1ml/L. 200ml/acre. Reply YES -Bhoomi",
}

def get_demo_response(crop, language, channel, farmer_name):
    name = farmer_name or "Farmer"
    if channel == "SMS":
        return SMS_RESPONSES.get(crop, SMS_RESPONSES["Rice"]).format(name=name)
    key = (crop or "Rice", language or "Hindi", channel or "WhatsApp")
    if key in DEMO_RESPONSES:
        return DEMO_RESPONSES[key].format(name=name)
    for k, v in DEMO_RESPONSES.items():
        if k[0] == crop:
            return v.format(name=name)
    return DEMO_RESPONSES[("Rice", "Hindi", "WhatsApp")].format(name=name)
