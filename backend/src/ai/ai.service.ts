import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

@Injectable()
export class AiService {
  private aiServiceUrl: string;

  constructor(private configService: ConfigService) {
    this.aiServiceUrl = this.configService.get<string>('AI_SERVICE_URL') || 'http://localhost:8000';
  }

  async generateAdCopy(prompt: string, context?: any) {
    try {
      const response = await axios.post(`${this.aiServiceUrl}/generate`, {
        prompt,
        context,
      });
      return response.data;
    } catch (error) {
      console.error('Error generating ad copy:', error);
      throw new Error('Failed to generate ad copy');
    }
  }

  async getOptimizationSuggestions(campaignData: any, performanceData: any) {
    try {
      const response = await axios.post(`${this.aiServiceUrl}/suggest`, {
        campaign: campaignData,
        performance: performanceData,
      });
      return response.data;
    } catch (error) {
      console.error('Error getting optimization suggestions:', error);
      throw new Error('Failed to get optimization suggestions');
    }
  }

  async queryKnowledgeBase(question: string) {
    try {
      const response = await axios.post(`${this.aiServiceUrl}/rag/query`, {
        question,
      });
      return response.data;
    } catch (error) {
      console.error('Error querying knowledge base:', error);
      throw new Error('Failed to query knowledge base');
    }
  }

  async chatCompletion(messages: any[]) {
    try {
      const response = await axios.post(`${this.aiServiceUrl}/chat`, {
        messages,
      });
      return response.data;
    } catch (error) {
      console.error('Error in chat completion:', error);
      throw new Error('Failed to complete chat');
    }
  }
}
