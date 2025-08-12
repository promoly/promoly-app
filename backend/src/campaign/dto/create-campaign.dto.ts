import { IsString, IsNumber, IsEnum, IsOptional, IsBoolean, IsObject } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { CampaignObjective, BudgetType } from '@prisma/client';

export class CreateCampaignDto {
  @ApiProperty({ example: 'Summer Sale Campaign' })
  @IsString()
  name: string;

  @ApiProperty({ enum: CampaignObjective, example: CampaignObjective.LEADS })
  @IsEnum(CampaignObjective)
  objective: CampaignObjective;

  @ApiProperty({ example: 100.0 })
  @IsNumber()
  budget: number;

  @ApiProperty({ enum: BudgetType, example: BudgetType.DAILY })
  @IsEnum(BudgetType)
  budgetType: BudgetType;

  @ApiProperty({ example: { age: [25, 45], interests: ['fashion', 'shopping'] }, required: false })
  @IsOptional()
  @IsObject()
  targetAudience?: any;

  @ApiProperty({ example: { headline: 'Summer Sale', description: 'Get 50% off' }, required: false })
  @IsOptional()
  @IsObject()
  adCreative?: any;

  @ApiProperty({ example: 'act_123456789', required: false })
  @IsOptional()
  @IsString()
  metaAccountId?: string;

  @ApiProperty({ example: true, required: false })
  @IsOptional()
  @IsBoolean()
  createOnMeta?: boolean;
}
