import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCampaignDto } from './dto/create-campaign.dto';
import { UpdateCampaignDto } from './dto/update-campaign.dto';
import { MetaIntegrationService } from '../meta-integration/meta-integration.service';

@Injectable()
export class CampaignService {
  constructor(
    private prisma: PrismaService,
    private metaIntegrationService: MetaIntegrationService,
    @InjectQueue('campaign-sync') private campaignSyncQueue: Queue,
    @InjectQueue('campaign-optimization') private campaignOptimizationQueue: Queue,
  ) {}

  async create(userId: string, createCampaignDto: CreateCampaignDto) {
    const campaign = await this.prisma.campaign.create({
      data: {
        ...createCampaignDto,
        userId,
      },
      include: {
        metaAccount: true,
        performances: true,
      },
    });

    // If campaign should be created on Meta Ads
    if (createCampaignDto.createOnMeta && campaign.metaAccount) {
      try {
        const metaCampaign = await this.metaIntegrationService.createCampaign(
          campaign.metaAccount.accessToken,
          campaign.metaAccount.adAccountId,
          createCampaignDto,
        );

        // Update campaign with Meta campaign ID
        await this.prisma.campaign.update({
          where: { id: campaign.id },
          data: { metaCampaignId: metaCampaign.id },
        });

        // Schedule performance sync
        await this.campaignSyncQueue.add('sync-campaign-performance', {
          campaignId: campaign.id,
          metaCampaignId: metaCampaign.id,
        });
      } catch (error) {
        console.error('Failed to create campaign on Meta:', error);
      }
    }

    return campaign;
  }

  async findAll(userId: string) {
    return this.prisma.campaign.findMany({
      where: { userId },
      include: {
        metaAccount: true,
        performances: {
          orderBy: { date: 'desc' },
          take: 1,
        },
        suggestions: {
          where: { status: 'PENDING' },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(userId: string, id: string) {
    const campaign = await this.prisma.campaign.findFirst({
      where: { id, userId },
      include: {
        metaAccount: true,
        performances: {
          orderBy: { date: 'desc' },
        },
        suggestions: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!campaign) {
      throw new NotFoundException('Campaign not found');
    }

    return campaign;
  }

  async update(userId: string, id: string, updateCampaignDto: UpdateCampaignDto) {
    const campaign = await this.findOne(userId, id);

    const updatedCampaign = await this.prisma.campaign.update({
      where: { id },
      data: updateCampaignDto,
      include: {
        metaAccount: true,
        performances: true,
      },
    });

    // Update on Meta Ads if campaign exists there
    if (campaign.metaCampaignId && campaign.metaAccount) {
      try {
        await this.metaIntegrationService.updateCampaign(
          campaign.metaAccount.accessToken,
          campaign.metaCampaignId,
          updateCampaignDto,
        );
      } catch (error) {
        console.error('Failed to update campaign on Meta:', error);
      }
    }

    return updatedCampaign;
  }

  async remove(userId: string, id: string) {
    const campaign = await this.findOne(userId, id);

    // Delete from Meta Ads if campaign exists there
    if (campaign.metaCampaignId && campaign.metaAccount) {
      try {
        await this.metaIntegrationService.deleteCampaign(
          campaign.metaAccount.accessToken,
          campaign.metaCampaignId,
        );
      } catch (error) {
        console.error('Failed to delete campaign on Meta:', error);
      }
    }

    return this.prisma.campaign.delete({
      where: { id },
    });
  }

  async getPerformance(userId: string, id: string, days: number = 30) {
    const campaign = await this.findOne(userId, id);
    
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    return this.prisma.campaignPerformance.findMany({
      where: {
        campaignId: id,
        date: {
          gte: startDate,
        },
      },
      orderBy: { date: 'asc' },
    });
  }

  async syncPerformance(campaignId: string, metaCampaignId: string) {
    try {
      const campaign = await this.prisma.campaign.findUnique({
        where: { id: campaignId },
        include: { metaAccount: true },
      });

      if (!campaign || !campaign.metaAccount) {
        throw new Error('Campaign or Meta account not found');
      }

      const performance = await this.metaIntegrationService.getCampaignPerformance(
        campaign.metaAccount.accessToken,
        metaCampaignId,
      );

      // Store performance data
      await this.prisma.campaignPerformance.upsert({
        where: {
          campaignId_date: {
            campaignId,
            date: new Date(),
          },
        },
        update: performance,
        create: {
          campaignId,
          ...performance,
        },
      });

      // Trigger AI optimization
      await this.campaignOptimizationQueue.add('optimize-campaign', {
        campaignId,
        performance,
      });

    } catch (error) {
      console.error('Failed to sync campaign performance:', error);
    }
  }
}
