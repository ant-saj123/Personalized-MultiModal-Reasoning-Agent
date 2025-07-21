from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
import uvicorn
import os
import sys
from contextlib import asynccontextmanager
from dotenv import load_dotenv

# Add the current directory to Python path so we can import rag_agent
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from rag_agent import RAGAgent

load_dotenv()

# Initialize RAG Agent
rag_agent = None

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Initialize and cleanup the RAG agent."""
    global rag_agent
    try:
        rag_agent = RAGAgent()
        print("✅ RAG Agent initialized successfully")
    except Exception as e:
        print(f"❌ Failed to initialize RAG Agent: {e}")
        rag_agent = None
    yield
    # Cleanup if needed
    rag_agent = None

app = FastAPI(
    title="RAG Agent API",
    description="API for the RAG Agent with Pinecone vector store",
    version="1.0.0",
    lifespan=lifespan
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000", "http://localhost:3001", "http://127.0.0.1:3001"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydantic models for request/response
class ChatRequest(BaseModel):
    message: str
    include_sources: bool = True

class ChatResponse(BaseModel):
    answer: str
    question: str
    timestamp: float
    sources: Optional[List[Dict[str, Any]]] = None
    error: Optional[bool] = None

class SearchRequest(BaseModel):
    query: str
    k: int = 5

class SearchResponse(BaseModel):
    documents: List[Dict[str, Any]]
    query: str

class StatsResponse(BaseModel):
    index_name: str
    total_vector_count: int
    dimension: int
    namespaces: Dict[str, Any]
    index_fullness: float

class HistoryResponse(BaseModel):
    history: List[Dict[str, str]]

# API Endpoints
@app.get("/")
async def root():
    """Health check endpoint."""
    return {"message": "RAG Agent API is running", "status": "healthy"}

@app.get("/health")
async def health_check():
    """Detailed health check."""
    if rag_agent is None:
        raise HTTPException(status_code=503, detail="RAG Agent not initialized")
    return {"status": "healthy", "agent_initialized": True}

@app.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    """Send a message to the RAG agent and get a response."""
    if rag_agent is None:
        raise HTTPException(status_code=503, detail="RAG Agent not initialized")
    
    try:
        response = rag_agent.ask(request.message, include_sources=request.include_sources)
        return ChatResponse(**response)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing chat: {str(e)}")

@app.post("/search", response_model=SearchResponse)
async def search_documents(request: SearchRequest):
    """Search for relevant documents without generating a response."""
    if rag_agent is None:
        raise HTTPException(status_code=503, detail="RAG Agent not initialized")
    
    try:
        docs = rag_agent.search_documents(request.query, k=request.k)
        documents = []
        for doc in docs:
            doc_info = {
                "content": doc.page_content,
                "metadata": doc.metadata,
                "type": doc.metadata.get("type", "unknown"),
                "source": doc.metadata.get("source", "unknown")
            }
            documents.append(doc_info)
        
        return SearchResponse(documents=documents, query=request.query)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error searching documents: {str(e)}")

@app.get("/stats", response_model=StatsResponse)
async def get_stats():
    """Get statistics about the vector store index."""
    if rag_agent is None:
        raise HTTPException(status_code=503, detail="RAG Agent not initialized")
    
    try:
        stats = rag_agent.get_index_stats()
        if "error" in stats:
            raise HTTPException(status_code=500, detail=stats["error"])
        return StatsResponse(**stats)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error getting stats: {str(e)}")

@app.get("/history", response_model=HistoryResponse)
async def get_history():
    """Get the current conversation history."""
    if rag_agent is None:
        raise HTTPException(status_code=503, detail="RAG Agent not initialized")
    
    try:
        history = rag_agent.get_conversation_history()
        return HistoryResponse(history=history)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error getting history: {str(e)}")

@app.delete("/history")
async def clear_history():
    """Clear the conversation history."""
    if rag_agent is None:
        raise HTTPException(status_code=503, detail="RAG Agent not initialized")
    
    try:
        rag_agent.clear_memory()
        return {"message": "Conversation history cleared successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error clearing history: {str(e)}")

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True) 