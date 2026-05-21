"""RAG Pipeline demo API endpoints"""
from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional
from app.rag.pipeline import get_rag_pipeline

router = APIRouter()

class RAGQuery(BaseModel):
    query: str
    crop: Optional[str] = None
    state: Optional[str] = None
    language: str = "English"
    channel: str = "WhatsApp"
    farmer_name: Optional[str] = None

@router.post("/query")
async def rag_query(req: RAGQuery):
    """Interactive RAG query for demo purposes."""
    rag = get_rag_pipeline()
    result = await rag.generate(
        query=req.query, crop=req.crop, state=req.state,
        language=req.language, channel=req.channel, farmer_name=req.farmer_name
    )
    return result

@router.get("/status")
async def rag_status():
    """Knowledge base status."""
    rag = get_rag_pipeline()
    doc_count = rag.collection.count() if rag.collection else len(rag._keyword_search("", None, 100))
    return {
        "status": "ready",
        "vector_store": "ChromaDB" if rag.collection else "Keyword Fallback",
        "documents": doc_count,
        "llm": "Groq Llama-3.3-70b" if rag.groq_client else "Demo Mode",
        "embedding_model": "ChromaDB Default" if rag.collection else "N/A",
        "crops_covered": ["Rice", "Cotton", "Wheat", "Sugarcane", "Groundnut"],
        "states_covered": ["Andhra Pradesh", "Maharashtra", "Tamil Nadu", "Punjab", "Uttar Pradesh"],
        "hallucination_guard": True,
    }

@router.post("/retrieve")
async def rag_retrieve(req: RAGQuery):
    """Retrieve relevant documents without generation."""
    rag = get_rag_pipeline()
    docs = rag.retrieve(req.query, req.crop)
    return {"query": req.query, "documents": docs, "count": len(docs)}
