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

app = FastAPI()

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
        # Use AI agent to generate response
        api_key = os.getenv("GOOGLE_API_KEY")
        if not api_key:
            raise HTTPException(status_code=500, detail="GOOGLE_API_KEY not found in environment variables.")
        
        agent = AI_Agent(api_key)
        response = agent.get_response(chat.message)
        return JSONResponse({
            "response": response
        })
    except Exception as e:
        print(f"Error in chat endpoint: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")
