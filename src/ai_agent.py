from typing import TypedDict
from langgraph.graph import StateGraph, START, END
from langchain.chat_models import init_chat_model
from langchain_core.messages import SystemMessage, HumanMessage

import os
from dotenv import load_dotenv

# Import the system prompt from prompts module
from src.prompts import SYSTEM_PROMPT

# Load environment variables from .env file
load_dotenv()

from datetime import datetime, timezone, timedelta
import hashlib

# setting up Firestore for caching
from firebase_admin import firestore, initialize_app
initialize_app()
db = firestore.client()

class AgentState(TypedDict):
    messages: list

class AI_Agent:
    def __init__(self, api_key: str):
        self.api_key = api_key
        self.llm = init_chat_model(os.getenv("LLM_MODEL"), temperature=0.1)
        self.system_prompt = SYSTEM_PROMPT


    def get_response(self, user_message: str) -> str:
        # Use a hash of the user message as the cache key
        cache_key = f"ai_response:{hashlib.sha256(user_message.encode()).hexdigest()}"
        cached = db.collection("sre-agent-cache").document(cache_key).get()
        if cached.exists:
            data = cached.to_dict()
            expires = data.get("expires")
            if expires and expires > datetime.now(timezone.utc):
                return data.get("response")
            else:
                # Optionally delete expired cache
                db.collection("sre-agent-cache").document(cache_key).delete()
        # Compose messages for the LLM
        messages = [
            SystemMessage(content=self.system_prompt),
            HumanMessage(content=user_message)
        ]
        response = self.llm(messages)
        
        # Store the response in Firestore cache with a 1-day expiration
        db.collection("sre-agent-cache").document(cache_key).set({
            "response": response.content,
            "expires": datetime.now(timezone.utc) + timedelta(days=1)
        })
        return response.content

def main():

    api_key = os.getenv("GOOGLE_API_KEY")
    if not api_key:
        print("GOOGLE_API_KEY not found in environment variables.")
        return
    

    agent = AI_Agent(api_key)
    user_input = input("Ask your SRE Engineer question: ")
    print(agent.get_response(user_input))

if __name__ == "__main__":
    main()