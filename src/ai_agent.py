from typing import TypedDict, Optional, List, Dict, Any
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

# setting up Firestore for caching and chat history
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
        self.db = db

    def get_response(self, user_message: str, user_id: Optional[str] = None) -> str:
        """Get AI response with context from chat history and extended caching"""
        try:
            # Get chat context for better responses
            context = ""
            if user_id:
                context = self.get_chat_context(user_id)
            
            # Build enhanced prompt with context
            enhanced_prompt = self.build_contextual_prompt(user_message, context)
            
            # Use enhanced prompt for cache key
            cache_key = f"ai_response:{hashlib.sha256(enhanced_prompt.encode()).hexdigest()}"
            cached = self.db.collection("sre-agent-cache").document(cache_key).get()
            
            if cached.exists:
                data = cached.to_dict()
                expires = data.get("expires")
                if expires and expires > datetime.now(timezone.utc):
                    print(f"Cache hit for user query")
                    return data.get("response")
                else:
                    # Delete expired cache
                    self.db.collection("sre-agent-cache").document(cache_key).delete()
            
            # Generate new response
            messages = [
                SystemMessage(content=self.system_prompt),
                HumanMessage(content=enhanced_prompt)
            ]
            response = self.llm(messages)
            
            # Store the response in Firestore cache with 1-month expiration
            self.db.collection("sre-agent-cache").document(cache_key).set({
                "response": response.content,
                "expires": datetime.now(timezone.utc) + timedelta(days=30),  # Extended to 1 month
                "created_at": datetime.now(timezone.utc),
                "original_query": user_message  # For debugging
            })
            
            return response.content
            
        except Exception as e:
            print(f"Error generating response: {e}")
            return "I apologize, but I'm having trouble processing your request right now. Please try again."

    def get_chat_context(self, user_id: str) -> str:
        """Get recent chat history for context"""
        try:
            history_ref = self.db.collection('sre-agent-chat-history').document(f"user_{user_id}")
            doc = history_ref.get()
            
            if doc.exists:
                data = doc.to_dict()
                conversations = data.get('conversations', [])
                
                # Get last 5 conversations for context (not too much to avoid token limits)
                recent_conversations = conversations[-5:]
                
                if recent_conversations:
                    context_parts = []
                    for conv in recent_conversations:
                        context_parts.append(f"Previous User: {conv['user_message']}")
                        context_parts.append(f"Previous Assistant: {conv['bot_response'][:200]}...")  # Limit response length
                    
                    return "\n".join(context_parts)
                
        except Exception as e:
            print(f"Error getting chat context: {e}")
            
        return ""

    def build_contextual_prompt(self, user_message: str, context: str) -> str:
        """Build prompt with chat context"""
        if context:
            contextual_prompt = f"""
You are continuing a conversation. Here's the recent context:

{context}

Current user message: {user_message}

Please provide a helpful response considering the conversation context above. If the user is asking a follow-up question, reference the previous conversation appropriately.
"""
        else:
            contextual_prompt = user_message
            
        return contextual_prompt

    def save_chat_history(self, user_id: str, user_message: str, bot_response: str):
        """Save chat conversation to Firestore with 1-week expiration"""
        try:
            history_ref = self.db.collection('sre-agent-chat-history').document(f"user_{user_id}")
            doc = history_ref.get()
            
            # Create conversation entry
            conversation = {
                'user_message': user_message,
                'bot_response': bot_response,
                'timestamp': datetime.now(timezone.utc).isoformat()
            }
            
            if doc.exists:
                # Update existing history
                data = doc.to_dict()
                conversations = data.get('conversations', [])
                conversations.append(conversation)
                
                # Keep only last 50 conversations (limit storage)
                conversations = conversations[-50:]
                
                history_ref.update({
                    'conversations': conversations,
                    'updated_at': datetime.now(timezone.utc),
                    'expires_at': datetime.now(timezone.utc) + timedelta(days=7)  # 1 week
                })
            else:
                # Create new history
                history_ref.set({
                    'conversations': [conversation],
                    'created_at': datetime.now(timezone.utc),
                    'updated_at': datetime.now(timezone.utc),
                    'expires_at': datetime.now(timezone.utc) + timedelta(days=7)  # 1 week
                })
                
            print(f"Chat history saved for user {user_id}")
                
        except Exception as e:
            print(f"Error saving chat history: {e}")
            # Don't raise to avoid breaking the main flow

    def get_chat_history(self, user_id: str, limit: int = 20) -> List[Dict[str, Any]]:
        """Get chat history for a user"""
        try:
            history_ref = self.db.collection('sre-agent-chat-history').document(f"user_{user_id}")
            doc = history_ref.get()
            
            if doc.exists:
                data = doc.to_dict()
                conversations = data.get('conversations', [])
                
                # Sort by timestamp (newest first) and limit
                conversations.sort(key=lambda x: x.get('timestamp', ''), reverse=True)
                return conversations[:limit]
                
        except Exception as e:
            print(f"Error fetching chat history: {e}")
            
        return []

    def delete_chat_history(self, user_id: str):
        """Delete all chat history for a user"""
        try:
            history_ref = self.db.collection('sre-agent-chat-history').document(f"user_{user_id}")
            history_ref.delete()
            print(f"Chat history deleted for user {user_id}")
        except Exception as e:
            print(f"Error deleting chat history: {e}")
            raise

    # cleanup_expired_data removed for now

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