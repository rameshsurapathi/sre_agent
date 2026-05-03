from typing import TypedDict, Optional, List, Dict, Any
from langgraph.graph import StateGraph, START, END
from langchain.chat_models import init_chat_model
from langchain_core.messages import SystemMessage, HumanMessage
import os
from dotenv import load_dotenv
from datetime import datetime, timezone, timedelta
import hashlib
from src.prompts import SYSTEM_PROMPT
from src.storage_helper import R2Storage

load_dotenv()

class AgentState(TypedDict):
    messages: list

class AI_Agent:
    def __init__(self, api_key: str):
        self.api_key = api_key
        # Use init_chat_model or direct ChatGoogleGenerativeAI
        self.llm = init_chat_model(os.getenv("LLM_MODEL", "google-genai"), temperature=0.1)
        self.system_prompt = SYSTEM_PROMPT
        self.storage = R2Storage("sre-agent")

    def get_response(self, user_message: str, user_id: Optional[str] = None) -> str:
        try:
            context = ""
            if user_id:
                context = self.get_chat_context(user_id)
            
            enhanced_prompt = self.build_contextual_prompt(user_message, context)
            
            messages = [
                SystemMessage(content=self.system_prompt),
                HumanMessage(content=enhanced_prompt)
            ]
            response = self.llm(messages)
            
            if user_id:
                self.save_chat_history(user_id, user_message, response.content)
            
            return response.content
            
        except Exception as e:
            print(f"Error generating response: {e}")
            return "I apologize, but I'm having trouble processing your request right now. Please try again."

    def get_chat_context(self, user_id: str) -> str:
        try:
            conversations = self.storage.get_history(user_id)
            recent_conversations = conversations[-5:]
            
            if recent_conversations:
                context_parts = []
                for conv in recent_conversations:
                    context_parts.append(f"Previous User: {conv['user_message']}")
                    context_parts.append(f"Previous Assistant: {conv['bot_response'][:200]}...")
                return "\n".join(context_parts)
        except Exception as e:
            print(f"Error getting chat context: {e}")
        return ""

    def build_contextual_prompt(self, user_message: str, context: str) -> str:
        if context:
            return f"Context:\n{context}\n\nCurrent user message: {user_message}"
        return user_message

    def save_chat_history(self, user_id: str, user_message: str, bot_response: str):
        try:
            history = self.storage.get_history(user_id)
            history.append({
                'user_message': user_message,
                'bot_response': bot_response,
                'timestamp': datetime.now(timezone.utc).isoformat()
            })
            self.storage.save_history(user_id, history)
        except Exception as e:
            print(f"Error saving chat history: {e}")

    def get_chat_history(self, user_id: str, limit: int = 20) -> List[Dict[str, Any]]:
        try:
            history = self.storage.get_history(user_id)
            history.sort(key=lambda x: x.get('timestamp', ''), reverse=True)
            return history[:limit]
        except Exception:
            return []

    def delete_chat_history(self, user_id: str):
        self.storage.delete_history(user_id)

def main():
    api_key = os.getenv("GOOGLE_API_KEY")
    if not api_key:
        print("GOOGLE_API_KEY not found.")
        return
    agent = AI_Agent(api_key)
    user_input = input("Ask your SRE Engineer question: ")
    print(agent.get_response(user_input))

if __name__ == "__main__":
    main()
