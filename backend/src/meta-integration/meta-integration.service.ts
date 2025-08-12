import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMetaAccountDto } from './dto/create-meta-account.dto';
import { CreateCampaignDto } from '../campaign/dto/create-campaign.dto';
import { UpdateCampaignDto } from '../campaign/dto/update-campaign.dto';

// Facebook Business SDK
const bizSdk = require('facebook-business');

@Injectable()
export class MetaIntegrationService {
  constructor(
    private configService: ConfigService,
    private prisma: PrismaService,
  ) {}

  async createMetaAccount(userId: string, createMetaAccountDto: CreateMetaAccountDto) {
    return this.prisma.metaAccount.create({
      data: {
        ...createMetaAccountDto,
        userId,
      },
    });
  }

  async getMetaAccounts(userId: string) {
    return this.prisma.metaAccount.findMany({
      where: { userId, isActive: true },
    });
  }

  async createCampaign(accessToken: string, adAccountId: string, campaignData: CreateCampaignDto) {
    const api = bizSdk.FacebookAdsApi.init(accessToken);
    const account = new bizSdk.AdAccount(adAccountId);

    const campaign = await account.createCampaign(
      [],
      {
        name: campaignData.name,
        objective: this.mapObjectiveToMeta(campaignData.objective),
        status: 'PAUSED', // Start paused for safety
        special_ad_categories: [],
      },
    );

    // Create ad set
    const adSet = await account.createAdSet(
      [],
      {
        name: `${campaignData.name} - Ad Set`,
        campaign_id: campaign.id,
        daily_budget: campaignData.budget * 100, // Convert to cents
        billing_event: 'IMPRESSIONS',
        optimization_goal: this.mapObjectiveToOptimizationGoal(campaignData.objective),
        targeting: campaignData.targetAudience || {},
        status: 'PAUSED',
      },
    );

    return {
      id: campaign.id,
      adSetId: adSet.id,
    };
  }

  async updateCampaign(accessToken: string, campaignId: string, updateData: UpdateCampaignDto) {
    const api = bizSdk.FacebookAdsApi.init(accessToken);
    const campaign = new bizSdk.Campaign(campaignId);

    const updateFields: any = {};
    
    if (updateData.name) updateFields.name = updateData.name;
    if (updateData.budget) updateFields.daily_budget = updateData.budget * 100;
    if (updateData.status) updateFields.status = updateData.status;

    await campaign.update([], updateFields);
    
    return { success: true };
  }

  async deleteCampaign(accessToken: string, campaignId: string) {
    const api = bizSdk.FacebookAdsApi.init(accessToken);
    const campaign = new bizSdk.Campaign(campaignId);

    await campaign.delete();
    
    return { success: true };
  }

  async getCampaignPerformance(accessToken: string, campaignId: string) {
    const api = bizSdk.FacebookAdsApi.init(accessToken);
    const campaign = new bizSdk.Campaign(campaignId);

    const insights = await campaign.getInsights(
      ['reach', 'impressions', 'clicks', 'spend', 'actions'],
      {
        time_range: {
          since: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          until: new Date().toISOString().split('T')[0],
        },
      },
    );

    if (insights && insights.length > 0) {
      const insight = insights[0];
      const actions = insight.actions || [];
      const leads = actions.find((action: any) => action.action_type === 'lead')?.value || 0;

      return {
        reach: parseInt(insight.reach) || 0,
        impressions: parseInt(insight.impressions) || 0,
        clicks: parseInt(insight.clicks) || 0,
        leads: parseInt(leads) || 0,
        spend: parseFloat(insight.spend) || 0,
        cpm: parseFloat(insight.spend) / parseInt(insight.impressions) * 1000 || 0,
        cpc: parseFloat(insight.spend) / parseInt(insight.clicks) || 0,
        cpl: parseFloat(insight.spend) / parseInt(leads) || 0,
      };
    }

    return {
      reach: 0,
      impressions: 0,
      clicks: 0,
      leads: 0,
      spend: 0,
      cpm: 0,
      cpc: 0,
      cpl: 0,
    };
  }

  private mapObjectiveToMeta(objective: string): string {
    const mapping = {
      AWARENESS: 'BRAND_AWARENESS',
      CONSIDERATION: 'CONSIDERATION',
      CONVERSIONS: 'CONVERSIONS',
      LEADS: 'LEAD_GENERATION',
      SALES: 'CONVERSIONS',
    };
    return mapping[objective] || 'CONSIDERATION';
  }

  private mapObjectiveToOptimizationGoal(objective: string): string {
    const mapping = {
      AWARENESS: 'REACH',
      CONSIDERATION: 'LINK_CLICKS',
      CONVERSIONS: 'CONVERSIONS',
      LEADS: 'LEAD_GENERATION',
      SALES: 'CONVERSIONS',
    };
    return mapping[objective] || 'LINK_CLICKS';
  }
}
