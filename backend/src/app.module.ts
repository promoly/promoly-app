import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { BullModule } from '@nestjs/bull';
import { ScheduleModule } from '@nestjs/schedule';

import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { CampaignModule } from './campaign/campaign.module';
import { MetaIntegrationModule } from './meta-integration/meta-integration.module';
import { AiModule } from './ai/ai.module';
import { SuggestionsModule } from './suggestions/suggestions.module';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    BullModule.forRoot({
      redis: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT) || 6379,
      },
    }),
    ScheduleModule.forRoot(),
    PrismaModule,
    AuthModule,
    UsersModule,
    CampaignModule,
    MetaIntegrationModule,
    AiModule,
    SuggestionsModule,
  ],
})
export class AppModule {}
