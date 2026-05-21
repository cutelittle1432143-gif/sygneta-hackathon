"""
Bhoomi AI - FastAPI Backend
AI-Powered Hyper-Personalized Agricultural Marketing Platform
"""
import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from dotenv import load_dotenv

load_dotenv()

from app.api import campaigns, farmers, analytics, selfie, rag
from app.data.synthetic import seed_database, get_db

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Initialize services on startup."""
    print("[Bhoomi AI] Starting up...")
    print(f"[Bhoomi AI] Env check - GROQ_API_KEY: {'Configured' if os.getenv('GROQ_API_KEY') else 'Not Found'}")
    print(f"[Bhoomi AI] Env check - NEWS_API_KEY: {'Configured' if os.getenv('NEWS_API_KEY') else 'Not Found'}")
    print(f"[Bhoomi AI] Env check - OPENWEATHER_API_KEY: {'Configured' if os.getenv('OPENWEATHER_API_KEY') else 'Not Found'}")
    db = get_db()
    if not db.get("farmers"):
        print("[Bhoomi AI] Seeding synthetic data...")
        seed_database()
    print("[Bhoomi AI] Ready!")
    yield
    print("[Bhoomi AI] Shutting down...")

app = FastAPI(
    title="Bhoomi AI",
    description="AI-Powered Hyper-Personalized Agricultural Marketing Platform",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Static files for generated images
os.makedirs("static/selfies", exist_ok=True)
os.makedirs("static/audio", exist_ok=True)
app.mount("/static", StaticFiles(directory="static"), name="static")

# Routes
app.include_router(campaigns.router, prefix="/api/campaigns", tags=["Campaigns"])
app.include_router(farmers.router, prefix="/api/farmers", tags=["Farmers"])
app.include_router(analytics.router, prefix="/api/analytics", tags=["Analytics"])
app.include_router(selfie.router, prefix="/api/selfie", tags=["KrishiGarv Selfie"])
app.include_router(rag.router, prefix="/api/rag", tags=["RAG Pipeline"])

@app.get("/")
async def root():
    return {
        "name": "Bhoomi AI",
        "version": "1.0.0",
        "status": "running",
        "description": "AI-Powered Hyper-Personalized Agricultural Marketing Platform"
    }

@app.get("/health")
async def health():
    return {"status": "healthy", "rag": "ready", "agents": "ready"}
