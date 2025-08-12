import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';

import { CampaignController } from './campaign.controller';
import { CampaignService } from './campaign.service';
import { CampaignProcessor } from './campaign.processor';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'campaign-sync',
    }),
    BullModule.registerQueue({
      name: 'campaign-optimization',
    }),
  ],
  controllers: [CampaignController],
  providers: [CampaignService, CampaignProcessor],
  exports: [CampaignService],
})
export class CampaignModule {}
