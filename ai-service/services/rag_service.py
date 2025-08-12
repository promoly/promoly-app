import os
from typing import List, Tuple, Dict
from langchain_openai import ChatOpenAI
from langchain.schema import HumanMessage, SystemMessage

class RAGService:
    def __init__(self):
        self.llm = ChatOpenAI(
            model=os.getenv("MODEL_NAME", "gpt-4o-mini"),
            temperature=0.3,
            openai_api_key=os.getenv("OPENAI_API_KEY")
        )
        
        # Initialize knowledge base (in a real implementation, this would load from vector database)
        self.knowledge_base = self._initialize_knowledge_base()

    def _initialize_knowledge_base(self) -> List[Dict[str, str]]:
        """Initialize the marketing knowledge base with best practices"""
        return [
            {
                "content": "Facebook Ad Best Practices: Use high-quality images, keep text minimal, include clear CTAs, test multiple ad formats, and target specific audiences based on interests and behaviors.",
                "source": "Facebook Marketing Best Practices Guide"
            },
            {
                "content": "Ad Copy Optimization: Write compelling headlines under 40 characters, use emotional triggers, focus on benefits over features, include urgency or scarcity, and test different angles.",
                "source": "Digital Marketing Copywriting Guide"
            },
            {
                "content": "Audience Targeting: Start with broad audiences and narrow down based on performance, use lookalike audiences for scaling, exclude existing customers, and test different age ranges and interests.",
                "source": "Audience Targeting Strategies"
            },
            {
                "content": "Budget Optimization: Start with small budgets to test, increase budget for well-performing ads, use automatic bidding initially, and monitor cost per result metrics.",
                "source": "Budget Management Guide"
            },
            {
                "content": "Campaign Structure: Organize campaigns by objective, use ad sets for different audiences, create multiple ad variations, and maintain consistent naming conventions.",
                "source": "Campaign Organization Best Practices"
            },
            {
                "content": "Performance Metrics: Focus on cost per lead (CPL), click-through rate (CTR), conversion rate, and return on ad spend (ROAS). Track these metrics daily and optimize accordingly.",
                "source": "Performance Tracking Guide"
            },
            {
                "content": "Creative Testing: Test different images, videos, headlines, and ad copy. Use A/B testing with 20% budget allocation to test variations and scale winners.",
                "source": "Creative Testing Strategies"
            },
            {
                "content": "Lead Generation: Use lead ads for better conversion rates, optimize landing pages for mobile, offer valuable content, and follow up quickly with leads.",
                "source": "Lead Generation Best Practices"
            }
        ]

    async def query(self, question: str) -> Tuple[str, List[str]]:
        """Query the knowledge base and return relevant answers"""
        
        system_prompt = """You are a digital marketing expert assistant. Use the provided knowledge base to answer questions about Facebook advertising, ad optimization, and marketing best practices.
        
        Provide clear, actionable advice based on the knowledge base. If the knowledge base doesn't contain relevant information, provide general best practices based on your expertise.
        
        Always cite sources when possible."""
        
        # Simple keyword matching (in production, use vector similarity search)
        relevant_docs = self._find_relevant_documents(question)
        
        if not relevant_docs:
            # Fallback to general knowledge
            answer = await self._get_general_answer(question)
            return answer, ["General Marketing Knowledge"]
        
        # Create context from relevant documents
        context = "\n\n".join([doc["content"] for doc in relevant_docs])
        sources = [doc["source"] for doc in relevant_docs]
        
        query_prompt = f"""
        Knowledge Base Context:
        {context}
        
        User Question: {question}
        
        Provide a comprehensive answer based on the knowledge base context. Be specific and actionable.
        """
        
        try:
            response = await self.llm.ainvoke([
                SystemMessage(content=system_prompt),
                HumanMessage(content=query_prompt)
            ])
            
            return response.content, sources
            
        except Exception as e:
            print(f"Error querying knowledge base: {e}")
            return "I'm unable to access the knowledge base right now. Please try again later.", []

    def _find_relevant_documents(self, question: str) -> List[Dict[str, str]]:
        """Find relevant documents using simple keyword matching"""
        question_lower = question.lower()
        relevant_docs = []
        
        keywords = {
            "ad copy": ["copy", "headline", "text", "creative"],
            "audience": ["targeting", "audience", "demographics", "interests"],
            "budget": ["budget", "spend", "cost", "bidding"],
            "performance": ["metrics", "results", "cpl", "ctr", "roas"],
            "creative": ["image", "video", "visual", "creative"],
            "lead": ["lead", "conversion", "generation"],
            "campaign": ["campaign", "structure", "organization"]
        }
        
        for doc in self.knowledge_base:
            doc_lower = doc["content"].lower()
            
            # Check if any keywords match
            for category, category_keywords in keywords.items():
                if any(keyword in question_lower for keyword in category_keywords):
                    if any(keyword in doc_lower for keyword in category_keywords):
                        relevant_docs.append(doc)
                        break
        
        return relevant_docs[:3]  # Limit to 3 most relevant documents

    async def _get_general_answer(self, question: str) -> str:
        """Provide general answer when knowledge base doesn't have relevant information"""
        
        general_prompt = f"""You are a digital marketing expert. Answer this question about Facebook advertising or digital marketing:
        
        {question}
        
        Provide helpful, actionable advice based on general best practices."""
        
        try:
            response = await self.llm.ainvoke([
                HumanMessage(content=general_prompt)
            ])
            
            return response.content
            
        except Exception as e:
            print(f"Error getting general answer: {e}")
            return "I'm unable to provide a specific answer right now. Please try rephrasing your question or contact support."
