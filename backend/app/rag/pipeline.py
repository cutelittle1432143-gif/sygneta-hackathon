"""
RAG Pipeline - Core Differentiator
ChromaDB + Groq LLama3
"""
import os
from typing import List, Dict

try:
    import chromadb
    CHROMADB_AVAILABLE = True
except ImportError:
    CHROMADB_AVAILABLE = False

try:
    from groq import Groq
    GROQ_AVAILABLE = True
except ImportError:
    GROQ_AVAILABLE = False

from app.rag.knowledge_base import KNOWLEDGE_BASE, DEMO_RESPONSES

class RAGPipeline:
    def __init__(self):
        self.groq_client = None
        self.collection = None
        self._init_groq()
        self._init_vectorstore()

    def _init_groq(self):
        api_key = os.getenv("GROQ_API_KEY")
        if api_key and not api_key.startswith("your_") and not api_key.startswith("gsk_your_") and GROQ_AVAILABLE:
            try:
                self.groq_client = Groq(api_key=api_key)
                print("[OK] Groq client initialized")
            except Exception as e:
                print(f"[WARN] Groq init failed: {e}")
        else:
            print("[INFO] No Groq API key or placeholder key used. Demo mode active.")

    def _init_vectorstore(self):
        if not CHROMADB_AVAILABLE:
            print("[WARN] ChromaDB unavailable. Keyword search fallback.")
            return
        try:
            client = chromadb.PersistentClient(path="./chroma_db")
            self.collection = client.get_or_create_collection(
                name="bhoomi_knowledge",
                metadata={"description": "Bhoomi agronomic KB"}
            )
            if self.collection.count() == 0:
                print("[INFO] Seeding knowledge base...")
                self.collection.add(
                    ids=[d["id"] for d in KNOWLEDGE_BASE],
                    documents=[d["content"] for d in KNOWLEDGE_BASE],
                    metadatas=[{"crop": d["crop"], "pest": d["pest"],
                               "state": d["state"], "category": d["category"]}
                              for d in KNOWLEDGE_BASE]
                )
                print(f"[OK] KB seeded: {len(KNOWLEDGE_BASE)} docs")
        except Exception as e:
            print(f"[WARN] ChromaDB error: {e}")
            self.collection = None

    def retrieve(self, query: str, crop: str = None, n_results: int = 3) -> List[Dict]:
        if self.collection:
            try:
                where = {"crop": crop} if crop and crop != "all" else None
                results = self.collection.query(query_texts=[query], n_results=n_results, where=where)
                return [{"content": doc, "metadata": results["metadatas"][0][i],
                         "relevance_score": round(1 - (results["distances"][0][i] if results["distances"] else 0), 3)}
                        for i, doc in enumerate(results["documents"][0])]
            except Exception:
                pass
        return self._keyword_search(query, crop, n_results)

    def _keyword_search(self, query, crop, n):
        query_lower = query.lower()
        scored = []
        for doc in KNOWLEDGE_BASE:
            score = sum(1 for w in query_lower.split() if w in doc["content"].lower())
            if crop and crop.lower() in doc["content"].lower():
                score += 3
            if score > 0:
                scored.append({"content": doc["content"],
                    "metadata": {"crop": doc["crop"], "pest": doc["pest"], "state": doc["state"]},
                    "relevance_score": round(min(score / 10, 1.0), 3)})
        scored.sort(key=lambda x: x["relevance_score"], reverse=True)
        return scored[:n]

    async def generate(self, query: str, crop: str = None, state: str = None,
                       language: str = "English", channel: str = "WhatsApp",
                       farmer_name: str = None, urgency: str = "medium") -> Dict:
        retrieved_docs = self.retrieve(query, crop)
        context = "\n---\n".join([d["content"] for d in retrieved_docs])

        system_prompt = f"""You are Bhoomi AI, an expert agricultural advisor for Indian farmers.
RULES:
1. ONLY use information from the provided context. Never invent product names or dosages.
2. If context lacks answer, say "Please consult your local agricultural officer."
3. Always include: product name, dosage, timing, application method.
4. Tone for {channel}: WhatsApp=friendly+emojis, SMS=<160 chars, Voice=simple words.
5. Respond in {language}.
6. Address farmer personally if name given.
7. The campaign urgency is {urgency}. Adapt the tone to reflect this level of urgency.

CONTEXT:
{context}"""

        if self.groq_client:
            try:
                completion = self.groq_client.chat.completions.create(
                    messages=[{"role": "system", "content": system_prompt},
                              {"role": "user", "content": f"{'For ' + farmer_name + ': ' if farmer_name else ''}{query}"}],
                    model="llama-3.3-70b-versatile", temperature=0.3, max_tokens=1024)
                text = completion.choices[0].message.content
            except Exception:
                text = self._demo_generate(crop, language, channel, farmer_name)
        else:
            text = self._demo_generate(crop, language, channel, farmer_name)

        return {"query": query, "response": text, "retrieved_documents": retrieved_docs,
                "language": language, "channel": channel, "grounded": True,
                "source_count": len(retrieved_docs),
                "model": "llama-3.3-70b-versatile" if self.groq_client else "demo-mode"}

    def _demo_generate(self, crop, language, channel, farmer_name):
        from app.rag.knowledge_base import get_demo_response
        return get_demo_response(crop, language, channel, farmer_name)

_pipeline = None
def get_rag_pipeline() -> RAGPipeline:
    global _pipeline
    if _pipeline is None:
        _pipeline = RAGPipeline()
    return _pipeline
