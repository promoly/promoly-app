from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
import os
from dotenv import load_dotenv

from services.ai_service import AIService
from services.rag_service import RAGService
from services.optimization_service import OptimizationService

load_dotenv()

app = FastAPI(
    title="Promoly AI Service",
    description="AI-powered ads management & optimization service",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize services
ai_service = AIService()
rag_service = RAGService()
optimization_service = OptimizationService()

# Pydantic models
class GenerateRequest(BaseModel):
    prompt: str
    context: Optional[Dict[str, Any]] = None

class SuggestRequest(BaseModel):
    campaign: Dict[str, Any]
    performance: Dict[str, Any]

class RAGQueryRequest(BaseModel):
    question: str

class ChatRequest(BaseModel):
    messages: List[Dict[str, str]]

class GenerateResponse(BaseModel):
    content: str
    suggestions: List[str]

class SuggestResponse(BaseModel):
    suggestions: List[Dict[str, Any]]

class RAGResponse(BaseModel):
    answer: str
    sources: List[str]

class ChatResponse(BaseModel):
    response: str
    suggestions: List[str]

@app.get("/")
async def root():
    return {"message": "Promoly AI Service is running"}

@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "ai"}

@app.post("/generate", response_model=GenerateResponse)
async def generate_ad_copy(request: GenerateRequest):
    """Generate ad copy and creative ideas"""
    try:
        content, suggestions = await ai_service.generate_ad_copy(request.prompt, request.context)
        return GenerateResponse(content=content, suggestions=suggestions)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/suggest", response_model=SuggestResponse)
async def get_optimization_suggestions(request: SuggestRequest):
    """Get AI-powered optimization suggestions based on campaign performance"""
    try:
        suggestions = await optimization_service.get_suggestions(request.campaign, request.performance)
        return SuggestResponse(suggestions=suggestions)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/rag/query", response_model=RAGResponse)
async def query_knowledge_base(request: RAGQueryRequest):
    """Query the RAG knowledge base for marketing best practices"""
    try:
        answer, sources = await rag_service.query(request.question)
        return RAGResponse(answer=answer, sources=sources)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/chat", response_model=ChatResponse)
async def chat_completion(request: ChatRequest):
    """Chat completion for conversational onboarding and support"""
    try:
        response, suggestions = await ai_service.chat_completion(request.messages)
        return ChatResponse(response=response, suggestions=suggestions)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
