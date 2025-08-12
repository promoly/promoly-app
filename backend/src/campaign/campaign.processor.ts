import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';
import { Injectable } from '@nestjs/common';
import { CampaignService } from './campaign.service';
import { AiService } from '../ai/ai.service';
import { SuggestionsService } from '../suggestions/suggestions.service';

@Injectable()
@Processor('campaign-sync')
export class CampaignProcessor {
  constructor(
    private campaignService: CampaignService,
    private aiService: AiService,
    private suggestionsService: SuggestionsService,
  ) {}

  @Process('sync-campaign-performance')
  async handleSyncCampaignPerformance(job: Job) {
    const { campaignId, metaCampaignId } = job.data;
    
    try {
      await this.campaignService.syncPerformance(campaignId, metaCampaignId);
      console.log(`Synced performance for campaign ${campaignId}`);
    } catch (error) {
      console.error(`Failed to sync performance for campaign ${campaignId}:`, error);
      throw error;
    }
  }
}

@Injectable()
@Processor('campaign-optimization')
export class CampaignOptimizationProcessor {
  constructor(
    private aiService: AiService,
    private suggestionsService: SuggestionsService,
  ) {}

  @Process('optimize-campaign')
  async handleOptimizeCampaign(job: Job) {
    const { campaignId, performance } = job.data;
    
    try {
      // Get AI suggestions for optimization
      const suggestions = await this.aiService.getOptimizationSuggestions(
        { id: campaignId },
        performance,
      );

      // Create suggestions in database
      for (const suggestion of suggestions) {
        await this.suggestionsService.create('system', {
          type: suggestion.type,
          title: suggestion.title,
          description: suggestion.description,
          action: suggestion.action,
          campaignId,
          aiGenerated: true,
        });
      }

      console.log(`Generated ${suggestions.length} optimization suggestions for campaign ${campaignId}`);
    } catch (error) {
      console.error(`Failed to optimize campaign ${campaignId}:`, error);
      throw error;
    }
  }
}
