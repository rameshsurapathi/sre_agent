from fastapi import FastAPI, Request, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, HTMLResponse
from fastapi.templating import Jinja2Templates
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
import time
from collections import defaultdict
import os
from src.ai_agent import AI_Agent
from datetime import datetime, timedelta
import hashlib
from typing import Optional

app = FastAPI(docs_url=None, redoc_url=None, openapi_url=None)

# Allow CORS for local frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Set up Jinja2 templates and static files
templates = Jinja2Templates(directory="templates")

# Serve static files from the "static" directory
app.mount("/static", StaticFiles(directory="static"), name="static")

# Simple in-memory rate limiter: {ip: [timestamps]}
rate_limit_window = 60  # seconds
rate_limit_count = 5
rate_limit_data = defaultdict(list)

# Define the request model for chat messages
class ChatRequest(BaseModel):
    message: str
    user_id: Optional[str] = None

class ChatHistoryRequest(BaseModel):
    user_id: str
    limit: Optional[int] = 20

class DeleteHistoryRequest(BaseModel):
    user_id: str

def generate_enhanced_user_id(request: Request) -> str:
    """Generate enhanced user ID using browser fingerprinting"""
    # Get basic info
    ip = request.client.host
    user_agent = request.headers.get("user-agent", "")
    accept_language = request.headers.get("accept-language", "")
    
    # Create more robust fingerprint
    fingerprint = f"{ip}:{user_agent}:{accept_language}"
    return hashlib.sha256(fingerprint.encode()).hexdigest()[:16]  # Shorter but unique

@app.get("/", response_class=HTMLResponse)
async def root(request: Request):
    return templates.TemplateResponse("index.html", {"request": request})

@app.post("/api/chat")
async def chat_endpoint(request: Request, chat: ChatRequest):
    client_ip = request.client.host
    now = time.time()
    timestamps = rate_limit_data[client_ip]
    # Remove timestamps outside the window
    rate_limit_data[client_ip] = [t for t in timestamps if now - t < rate_limit_window]
    if len(rate_limit_data[client_ip]) >= rate_limit_count:
        raise HTTPException(status_code=429, detail="Rate limit exceeded. Please wait.")
    rate_limit_data[client_ip].append(now)

    try:
        # Get user ID from request or generate enhanced one
        user_id = chat.user_id or generate_enhanced_user_id(request)
        
        # Use AI agent to generate response with context
        api_key = os.getenv("GOOGLE_API_KEY")
        if not api_key:
            raise HTTPException(status_code=500, detail="GOOGLE_API_KEY not found in environment variables.")
        
        agent = AI_Agent(api_key)
        response = agent.get_response(chat.message, user_id)
        
        # Save to chat history
        try:
            agent.save_chat_history(user_id, chat.message, response)
        except Exception as e:
            print(f"Error saving chat history: {e}")
            # Don't fail the request if history save fails
        
        return JSONResponse({
            "response": response,
            "user_id": user_id
        })
    except Exception as e:
        print(f"Error in chat endpoint: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@app.post("/api/chat-history")
async def get_chat_history(request: Request, history_request: ChatHistoryRequest):
    """Get chat history for a user"""
    try:
        user_id = history_request.user_id
        limit = history_request.limit
        
        if not user_id:
            raise HTTPException(status_code=400, detail="User ID is required")
        
        # Use AI agent to get chat history
        api_key = os.getenv("GOOGLE_API_KEY")
        if not api_key:
            raise HTTPException(status_code=500, detail="GOOGLE_API_KEY not found in environment variables.")
        
        agent = AI_Agent(api_key)
        history = agent.get_chat_history(user_id, limit)
        
        return JSONResponse({"history": history})
    
    except Exception as e:
        print(f"Error in get_chat_history: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to fetch chat history: {str(e)}")

@app.delete("/api/chat-history")
async def delete_chat_history(request: Request, delete_request: DeleteHistoryRequest):
    """Delete all chat history for a user"""
    try:
        user_id = delete_request.user_id
        
        if not user_id:
            raise HTTPException(status_code=400, detail="User ID is required")
        
        # Use AI agent to delete chat history
        api_key = os.getenv("GOOGLE_API_KEY")
        if not api_key:
            raise HTTPException(status_code=500, detail="GOOGLE_API_KEY not found in environment variables.")
        
        agent = AI_Agent(api_key)
        agent.delete_chat_history(user_id)
        
        return JSONResponse({"message": "Chat history deleted successfully"})
    
    except Exception as e:
        print(f"Error in delete_chat_history: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to delete chat history: {str(e)}")

@app.post("/api/cleanup")
async def cleanup_expired_data(request: Request):
    """Manual cleanup endpoint for expired data"""
    try:
        api_key = os.getenv("GOOGLE_API_KEY")
        if not api_key:
            raise HTTPException(status_code=500, detail="GOOGLE_API_KEY not found in environment variables.")
        
        agent = AI_Agent(api_key)
        agent.cleanup_expired_data()
        
        return JSONResponse({"message": "Cleanup completed successfully"})
    
    except Exception as e:
        print(f"Error in cleanup: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to cleanup: {str(e)}")
