import os
import openai
from typing import List, Dict, Any, Tuple
from langchain_openai import ChatOpenAI
from langchain.schema import HumanMessage, SystemMessage

class AIService:
    def __init__(self):
        self.client = openai.OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
        self.model = os.getenv("MODEL_NAME", "gpt-4o-mini")
        self.llm = ChatOpenAI(
            model=self.model,
            temperature=0.7,
            openai_api_key=os.getenv("OPENAI_API_KEY")
        )

    async def generate_ad_copy(self, prompt: str, context: Dict[str, Any] = None) -> Tuple[str, List[str]]:
        """Generate ad copy and creative ideas"""
        
        system_prompt = """You are an expert digital marketing copywriter specializing in Facebook and Instagram ads. 
        Create compelling, conversion-focused ad copy that drives action.
        
        Guidelines:
        - Keep headlines under 40 characters for optimal display
        - Use emotional triggers and benefit-focused language
        - Include clear call-to-actions
        - Test different angles and approaches
        - Consider the target audience and platform
        """
        
        if context:
            context_str = f"\nContext: {context}"
        else:
            context_str = ""
        
        full_prompt = f"{system_prompt}{context_str}\n\nUser request: {prompt}"
        
        try:
            response = await self.llm.ainvoke([
                SystemMessage(content=system_prompt),
                HumanMessage(content=f"{context_str}\n\nUser request: {prompt}")
            ])
            
            content = response.content
            
            # Generate additional suggestions
            suggestions = await self._generate_suggestions(prompt, context)
            
            return content, suggestions
            
        except Exception as e:
            print(f"Error generating ad copy: {e}")
            return "Unable to generate ad copy at this time.", []

    async def chat_completion(self, messages: List[Dict[str, str]]) -> Tuple[str, List[str]]:
        """Handle conversational chat for onboarding and support"""
        
        system_prompt = """You are Promoly, an AI assistant for digital advertising. You help users:
        1. Set up and optimize their ad campaigns
        2. Understand their campaign performance
        3. Make data-driven decisions
        4. Learn best practices in digital marketing
        
        Be helpful, friendly, and provide actionable advice. When appropriate, suggest next steps or ask clarifying questions."""
        
        try:
            # Convert messages to LangChain format
            langchain_messages = [SystemMessage(content=system_prompt)]
            for msg in messages:
                if msg["role"] == "user":
                    langchain_messages.append(HumanMessage(content=msg["content"]))
                elif msg["role"] == "assistant":
                    langchain_messages.append(SystemMessage(content=msg["content"]))
            
            response = await self.llm.ainvoke(langchain_messages)
            
            # Generate follow-up suggestions
            suggestions = await self._generate_chat_suggestions(messages[-1]["content"] if messages else "")
            
            return response.content, suggestions
            
        except Exception as e:
            print(f"Error in chat completion: {e}")
            return "I'm having trouble processing your request right now. Please try again.", []

    async def _generate_suggestions(self, prompt: str, context: Dict[str, Any] = None) -> List[str]:
        """Generate additional creative suggestions"""
        
        suggestion_prompt = f"""Based on the request: "{prompt}"
        
        Generate 3-5 additional creative angles or approaches for this ad campaign.
        Each suggestion should be a brief, actionable idea.
        
        Format as a simple list."""
        
        try:
            response = await self.llm.ainvoke([
                HumanMessage(content=suggestion_prompt)
            ])
            
            # Parse suggestions from response
            suggestions = [line.strip() for line in response.content.split('\n') if line.strip() and not line.startswith('#')]
            return suggestions[:5]  # Limit to 5 suggestions
            
        except Exception as e:
            print(f"Error generating suggestions: {e}")
            return []

    async def _generate_chat_suggestions(self, last_message: str) -> List[str]:
        """Generate follow-up suggestions for chat"""
        
        suggestion_prompt = f"""Based on the user's message: "{last_message}"
        
        Suggest 2-3 helpful follow-up questions or actions the user might want to take.
        Keep suggestions short and actionable."""
        
        try:
            response = await self.llm.ainvoke([
                HumanMessage(content=suggestion_prompt)
            ])
            
            suggestions = [line.strip() for line in response.content.split('\n') if line.strip() and not line.startswith('#')]
            return suggestions[:3]
            
        except Exception as e:
            print(f"Error generating chat suggestions: {e}")
            return []
