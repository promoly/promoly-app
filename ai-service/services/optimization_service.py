import os
from typing import List, Dict, Any
from langchain_openai import ChatOpenAI
from langchain.schema import HumanMessage, SystemMessage

class OptimizationService:
    def __init__(self):
        self.llm = ChatOpenAI(
            model=os.getenv("MODEL_NAME", "gpt-4o-mini"),
            temperature=0.3,
            openai_api_key=os.getenv("OPENAI_API_KEY")
        )

    async def get_suggestions(self, campaign: Dict[str, Any], performance: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Generate optimization suggestions based on campaign performance"""
        
        system_prompt = """You are an expert digital marketing analyst specializing in Facebook and Instagram ad optimization.
        
        Analyze campaign performance data and provide actionable optimization suggestions.
        
        For each suggestion, provide:
        - type: BUDGET_OPTIMIZATION, AUDIENCE_TARGETING, CREATIVE_IMPROVEMENT, BID_ADJUSTMENT, or CAMPAIGN_STRUCTURE
        - title: A clear, concise title
        - description: Detailed explanation with reasoning
        - action: JSON object with specific actions to take
        - priority: HIGH, MEDIUM, or LOW
        - expected_impact: Estimated improvement percentage
        """
        
        # Format performance data for analysis
        performance_summary = self._format_performance_data(performance)
        campaign_summary = self._format_campaign_data(campaign)
        
        analysis_prompt = f"""
        Campaign Information:
        {campaign_summary}
        
        Performance Data:
        {performance_summary}
        
        Based on this data, provide 3-5 specific optimization suggestions.
        Focus on actionable insights that can improve performance.
        
        Return suggestions in JSON format:
        [
            {{
                "type": "BUDGET_OPTIMIZATION",
                "title": "Increase Daily Budget",
                "description": "Your campaign is performing well with a low CPL. Consider increasing the daily budget by $20 to scale successful performance.",
                "action": {{
                    "action_type": "increase_budget",
                    "amount": 20,
                    "reasoning": "Low CPL indicates efficient spending"
                }},
                "priority": "HIGH",
                "expected_impact": 25
            }}
        ]
        """
        
        try:
            response = await self.llm.ainvoke([
                SystemMessage(content=system_prompt),
                HumanMessage(content=analysis_prompt)
            ])
            
            # Parse JSON response
            import json
            suggestions = json.loads(response.content)
            
            # Validate and clean suggestions
            validated_suggestions = []
            for suggestion in suggestions:
                if self._validate_suggestion(suggestion):
                    validated_suggestions.append(suggestion)
            
            return validated_suggestions[:5]  # Limit to 5 suggestions
            
        except Exception as e:
            print(f"Error generating optimization suggestions: {e}")
            return self._get_fallback_suggestions(performance)

    def _format_performance_data(self, performance: Dict[str, Any]) -> str:
        """Format performance data for analysis"""
        if not performance:
            return "No performance data available"
        
        return f"""
        - Reach: {performance.get('reach', 0):,}
        - Impressions: {performance.get('impressions', 0):,}
        - Clicks: {performance.get('clicks', 0):,}
        - Leads: {performance.get('leads', 0):,}
        - Spend: ${performance.get('spend', 0):.2f}
        - CPM: ${performance.get('cpm', 0):.2f}
        - CPC: ${performance.get('cpc', 0):.2f}
        - CPL: ${performance.get('cpl', 0):.2f}
        """

    def _format_campaign_data(self, campaign: Dict[str, Any]) -> str:
        """Format campaign data for analysis"""
        if not campaign:
            return "No campaign data available"
        
        return f"""
        - Name: {campaign.get('name', 'Unknown')}
        - Objective: {campaign.get('objective', 'Unknown')}
        - Budget: ${campaign.get('budget', 0):.2f} ({campaign.get('budgetType', 'DAILY')})
        - Status: {campaign.get('status', 'Unknown')}
        """

    def _validate_suggestion(self, suggestion: Dict[str, Any]) -> bool:
        """Validate suggestion structure"""
        required_fields = ['type', 'title', 'description', 'action', 'priority', 'expected_impact']
        return all(field in suggestion for field in required_fields)

    def _get_fallback_suggestions(self, performance: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Provide fallback suggestions when AI analysis fails"""
        suggestions = []
        
        if performance.get('cpl', 0) > 50:
            suggestions.append({
                "type": "BUDGET_OPTIMIZATION",
                "title": "Optimize for Lower Cost Per Lead",
                "description": "Your cost per lead is high. Consider adjusting targeting or creative to improve efficiency.",
                "action": {
                    "action_type": "optimize_targeting",
                    "reasoning": "High CPL indicates inefficient targeting"
                },
                "priority": "HIGH",
                "expected_impact": 20
            })
        
        if performance.get('clicks', 0) < 100:
            suggestions.append({
                "type": "CREATIVE_IMPROVEMENT",
                "title": "Improve Ad Creative",
                "description": "Low click-through rate suggests creative improvements are needed.",
                "action": {
                    "action_type": "test_creative",
                    "reasoning": "Low CTR indicates poor creative performance"
                },
                "priority": "MEDIUM",
                "expected_impact": 15
            })
        
        return suggestions
