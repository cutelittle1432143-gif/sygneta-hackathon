import os
import random
import uuid
import json
import requests
import xml.etree.ElementTree as ET
from datetime import datetime
from app.rag.pipeline import get_rag_pipeline
from app.data.synthetic import get_db

class AutomationService:
    def __init__(self):
        self.news_api_key = os.getenv("NEWS_API_KEY")
        self.weather_api_key = os.getenv("OPENWEATHER_API_KEY")
        self.pipeline = get_rag_pipeline()

    def fetch_agricultural_news(self) -> list:
        articles = []
        # Try NewsAPI first
        if self.news_api_key and not self.news_api_key.startswith("your_"):
            try:
                url = f"https://newsapi.org/v2/everything?q=agriculture+india+crop+pest+disease&sortBy=publishedAt&pageSize=10&apiKey={self.news_api_key}"
                r = requests.get(url, timeout=10)
                if r.status_code == 200:
                    data = r.json()
                    for item in data.get("articles", []):
                        articles.append({
                            "title": item.get("title") or "",
                            "description": item.get("description") or "",
                            "url": item.get("url") or "",
                            "source": "NewsAPI"
                        })
                    print(f"[Automation] Fetched {len(articles)} articles from NewsAPI")
                    if articles:
                        return articles
            except Exception as e:
                print(f"[Automation] NewsAPI failed: {e}")

        # Fallback to Google News RSS feed
        try:
            url = "https://news.google.com/rss/search?q=agriculture+india+pest+crop+disease&hl=en-IN&gl=IN&ceid=IN:en"
            r = requests.get(url, timeout=10)
            if r.status_code == 200:
                root = ET.fromstring(r.text)
                for item in root.findall(".//item")[:10]:
                    title = item.find("title").text if item.find("title") is not None else ""
                    link = item.find("link").text if item.find("link") is not None else ""
                    desc = title
                    if " - " in title:
                        title_clean = title.rsplit(" - ", 1)[0]
                    else:
                        title_clean = title
                    articles.append({
                        "title": title_clean,
                        "description": desc,
                        "url": link,
                        "source": "Google News RSS"
                    })
                print(f"[Automation] Fetched {len(articles)} articles from RSS feed")
                if articles:
                    return articles
        except Exception as e:
            print(f"[Automation] RSS fetch failed: {e}")

        # Seeded static fallback
        print("[Automation] Offline/fallback mode: using seeded agronomic news items")
        return [
            {
                "title": "Pink Bollworm attack reported in Cotton fields of Wardha district, Maharashtra",
                "description": "Local agriculture officers warn of bollworm spreading in cotton crops due to humid weather.",
                "url": "https://agrinews.in/bollworm-wardha",
                "source": "Seeded Alert"
            },
            {
                "title": "Yellow Rust disease detected in wheat crops of Ludhiana, Punjab",
                "description": "Farmers advised to inspect wheat leaves for yellow powdery spores. Cold and damp conditions aiding disease spread.",
                "url": "https://agrinews.in/yellow-rust-ludhiana",
                "source": "Seeded Alert"
            },
            {
                "title": "Rice Blast disease threat rises in West Godavari, Andhra Pradesh after recent rain",
                "description": "Recent rain followed by high humidity has created favorable conditions for Rice Blast fungus.",
                "url": "https://agrinews.in/rice-blast-godavari",
                "source": "Seeded Alert"
            }
        ]

    def fetch_weather_status(self, state: str, district: str) -> str:
        # 1. Try WeatherStack first since user explicitly has configured this key in NEWS_API_KEY
        if self.news_api_key and not self.news_api_key.startswith("your_"):
            try:
                url = f"http://api.weatherstack.com/current?access_key={self.news_api_key}&query={district}"
                r = requests.get(url, timeout=5)
                if r.status_code == 200:
                    data = r.json()
                    if "current" in data:
                        temp = data["current"].get("temperature")
                        humidity = data["current"].get("humidity")
                        desc_list = data["current"].get("weather_descriptions", ["Cloudy"])
                        desc = desc_list[0] if desc_list else "Cloudy"
                        print(f"[Automation] Successfully fetched live weather via WeatherStack for {district}")
                        return f"{desc.capitalize()}, Temperature: {temp}°C, Humidity: {humidity}%"
            except Exception as e:
                print(f"[Automation] WeatherStack API failed for {district}: {e}")

        # 2. Try OpenWeatherMap
        if self.weather_api_key and not self.weather_api_key.startswith("your_"):
            try:
                url = f"https://api.openweathermap.org/data/2.5/weather?q={district},IN&units=metric&appid={self.weather_api_key}"
                r = requests.get(url, timeout=5)
                if r.status_code == 200:
                    data = r.json()
                    temp = data.get("main", {}).get("temp")
                    humidity = data.get("main", {}).get("humidity")
                    desc = data.get("weather", [{}])[0].get("description", "cloudy")
                    print(f"[Automation] Successfully fetched live weather via OWM for {district}")
                    return f"{desc.capitalize()}, Temperature: {temp}°C, Humidity: {humidity}%"
            except Exception as e:
                print(f"[Automation] OWM Weather API failed for {district}: {e}")

        # 3. Fallback options
        weather_options = {
            "Maharashtra": ["High Humidity (85%), Temperature: 31°C, cloudy skies", "Light Rain, Temperature: 28°C, Humidity: 90%"],
            "Punjab": ["Overcast, Temperature: 18°C, damp morning dew", "Moderate Rain, Temperature: 16°C, Humidity: 95%"],
            "Andhra Pradesh": ["Scattered Rain, Temperature: 32°C, Humidity: 88%", "Warm & Humid, Temperature: 34°C, Humidity: 80%"],
            "Tamil Nadu": ["Heavy Showers, Temperature: 29°C, Humidity: 92%", "Cloudy, Temperature: 30°C, Humidity: 85%"],
            "Uttar Pradesh": ["Dry and Sunny, Temperature: 22°C, Humidity: 45%", "Cool Morning Mist, Temperature: 15°C, Humidity: 70%"]
        }
        return random.choice(weather_options.get(state, ["Sunny, Temperature: 25°C, Humidity: 60%"]))

    def generate_proposals(self) -> list:
        articles = self.fetch_agricultural_news()
        
        # If Groq client is available, use it for intelligent parsing
        if self.pipeline.groq_client:
            try:
                system_prompt = """You are Bhoomi AI, an expert agricultural automation engine.
Analyze the following list of agricultural news articles and weather conditions in India.
Decide if any article highlights an active threat (pest, disease, weather issue) to crops that requires a marketing/agronomic alert campaign.

For each valid threat found, generate a campaign proposal.
You must return a JSON object with a single root key "proposals" containing a list of proposals.
Each proposal must have:
- "name": A concise campaign name (e.g. "Rice Blast Prevention - West Godavari")
- "crop": One of: "Rice", "Cotton", "Wheat", "Sugarcane", "Groundnut"
- "pest": The specific pest or disease name (e.g. "Rice Blast", "Bollworm", "Yellow Rust")
- "state": The Indian state matching the article (e.g. "Maharashtra", "Punjab", "Andhra Pradesh", "Tamil Nadu", "Uttar Pradesh")
- "district": The specific district matching the article (e.g. "Wardha", "Ludhiana", "West Godavari")
- "urgency": "high" or "medium" or "low"
- "trigger_news_headline": The headline of the news article that triggered this
- "trigger_news_url": The URL of the news article
- "trigger_weather": A summary of the weather condition
- "message_templates": A dictionary of the advice text in multiple target languages based on the target state's languages.
  Include: "English", and the state's local language (e.g., "Hindi" for UP, "Telugu" for AP, "Tamil" for TN, "Marathi" for Maharashtra, "Punjabi" for Punjab).
  Write professional agricultural advice in each language. Do not use any emojis in the text.
  Make sure each advice includes the product name and dosage matching standard guidelines, for example:
  - Rice Blast: Amistar Top 1ml/liter, spray in morning
  - Bollworm: Ampligo 0.4ml/liter, spray after 5 PM
  - Yellow Rust: Tilt 1ml/liter
  - Tikka Disease: Score 1ml/liter
  Ensure the generated translation is written in native script (e.g. Devanagari for Hindi/Marathi, Gurmukhi for Punjabi, Telugu script, Tamil script).

If no threat is found, return {"proposals": []}.
Only generate proposals for crops and states listed above."""

                input_data = {
                    "articles": articles,
                    "target_crops": ["Rice", "Cotton", "Wheat", "Sugarcane", "Groundnut"]
                }

                completion = self.pipeline.groq_client.chat.completions.create(
                    messages=[
                        {"role": "system", "content": system_prompt},
                        {"role": "user", "content": f"Analyze these articles: {json.dumps(input_data)}"}
                    ],
                    model="llama-3.3-70b-versatile",
                    temperature=0.2,
                    response_format={"type": "json_object"}
                )

                result = json.loads(completion.choices[0].message.content)
                proposals = result.get("proposals", [])
                
                # Add UUID and metadata
                for p in proposals:
                    p["id"] = str(uuid.uuid4())
                    p["status"] = "pending_approval"
                    p["created_at"] = datetime.now().isoformat()
                    # Calculate target farmers
                    db = get_db()
                    target_farmers = [f for f in db.get("farmers", []) if f["state"] == p["state"] and f["crop"] == p["crop"]]
                    p["target_farmers"] = len(target_farmers)
                
                print(f"[Automation] Groq generated {len(proposals)} proposals")
                return proposals
            except Exception as e:
                print(f"[Automation] Groq proposal generation failed: {e}")

        # Fallback to rule-based generation
        return self._rule_based_proposals(articles)

    def _rule_based_proposals(self, articles: list) -> list:
        proposals = []
        keywords_map = {
            "bollworm": {
                "crop": "Cotton", "pest": "Bollworm", "state": "Maharashtra", "district": "Wardha", "urgency": "high",
                "message_templates": {
                    "English": "Cotton Bollworm Alert: Protect your crop with Ampligo 0.4ml/liter. Spray after 5 PM.",
                    "Marathi": "कापूस बोंडअळी अलर्ट: आपल्या पिकाचे संरक्षण करा. अँप्लिगो 0.4 मि.ली./लिटर संध्याकाळी 5 नंतर फवारा."
                }
            },
            "yellow rust": {
                "crop": "Wheat", "pest": "Yellow Rust", "state": "Punjab", "district": "Ludhiana", "urgency": "high",
                "message_templates": {
                    "English": "Wheat Yellow Rust Alert: Spores detected. Apply Tilt 1ml/liter at first sign of disease.",
                    "Punjabi": "ਕਣਕ ਪੀਲਾ ਰਤੂਆ ਅਲਰਟ: ਬਿਮਾਰੀ ਦੇ ਪਹਿਲੇ ਲੱਛਣ 'ਤੇ ਟਿਲਟ 1 ਮਿ.ਲੀ./ਲਿਟਰ ਦਾ ਛਿੜਕਾਅ ਕਰੋ।"
                }
            },
            "rust": {
                "crop": "Wheat", "pest": "Yellow Rust", "state": "Punjab", "district": "Ludhiana", "urgency": "high",
                "message_templates": {
                    "English": "Wheat Rust Alert: Damp weather triggers Rust threat. Apply Tilt 1ml/liter.",
                    "Punjabi": "ਕਣਕ ਰਤੂਆ ਅਲਰਟ: ਨਮੀ ਵਾਲਾ ਮੌਸਮ ਬਿਮਾਰੀ ਵਧਾ ਸਕਦਾ ਹੈ। ਟਿਲट 1 ਮਿ.ਲੀ./ਲਿਟਰ ਲਗਾਓ।"
                }
            },
            "blast": {
                "crop": "Rice", "pest": "Rice Blast", "state": "Andhra Pradesh", "district": "West Godavari", "urgency": "high",
                "message_templates": {
                    "English": "Rice Blast Threat: High humidity trigger. Spray Amistar Top 1ml/liter in early morning.",
                    "Telugu": "వరి బ్లాస్ట్ హెచ్చరిక: ఉదయం పూట అమిస్టార్ టాప్ 1ml/లీటర్ పిచికారీ చేయండి."
                }
            }
        }

        for art in articles:
            title_lower = art["title"].lower()
            desc_lower = art["description"].lower()
            full_text = f"{title_lower} {desc_lower}"
            
            matched_template = None
            for kw, template in keywords_map.items():
                if kw in full_text:
                    matched_template = template
                    break
            
            if matched_template:
                weather = self.fetch_weather_status(matched_template["state"], matched_template["district"])
                db = get_db()
                target_farmers = [f for f in db.get("farmers", []) if f["state"] == matched_template["state"] and f["crop"] == matched_template["crop"]]
                proposals.append({
                    "id": str(uuid.uuid4()),
                    "name": f"{matched_template['crop']} {matched_template['pest']} Alert - {matched_template['district']}",
                    "crop": matched_template["crop"],
                    "pest": matched_template["pest"],
                    "state": matched_template["state"],
                    "district": matched_template["district"],
                    "urgency": matched_template["urgency"],
                    "status": "pending_approval",
                    "trigger_news_headline": art["title"],
                    "trigger_news_url": art["url"],
                    "trigger_weather": weather,
                    "message_templates": matched_template["message_templates"],
                    "target_farmers": len(target_farmers),
                    "created_at": datetime.now().isoformat()
                })
        
        seen = set()
        deduped = []
        for p in proposals:
            if p["name"] not in seen:
                seen.add(p["name"])
                deduped.append(p)
        return deduped
