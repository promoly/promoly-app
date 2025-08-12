import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

import { AiService } from './ai.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('AI')
@Controller('ai')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post('generate')
  @ApiOperation({ summary: 'Generate ad copy' })
  @ApiResponse({ status: 200, description: 'Ad copy generated successfully' })
  async generateAdCopy(@Body() body: { prompt: string; context?: any }) {
    return this.aiService.generateAdCopy(body.prompt, body.context);
  }

  @Post('suggest')
  @ApiOperation({ summary: 'Get optimization suggestions' })
  @ApiResponse({ status: 200, description: 'Suggestions generated successfully' })
  async getSuggestions(@Body() body: { campaign: any; performance: any }) {
    return this.aiService.getOptimizationSuggestions(body.campaign, body.performance);
  }

  @Post('rag/query')
  @ApiOperation({ summary: 'Query knowledge base' })
  @ApiResponse({ status: 200, description: 'Knowledge base queried successfully' })
  async queryKnowledgeBase(@Body() body: { question: string }) {
    return this.aiService.queryKnowledgeBase(body.question);
  }

  @Post('chat')
  @ApiOperation({ summary: 'Chat completion' })
  @ApiResponse({ status: 200, description: 'Chat completed successfully' })
  async chatCompletion(@Body() body: { messages: any[] }) {
    return this.aiService.chatCompletion(body.messages);
  }
}
