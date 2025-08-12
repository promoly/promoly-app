import { IsString, IsEnum, IsOptional, IsObject, IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { SuggestionType } from '@prisma/client';

export class CreateSuggestionDto {
  @ApiProperty({ example: 'BUDGET_OPTIMIZATION' })
  @IsEnum(SuggestionType)
  type: SuggestionType;

  @ApiProperty({ example: 'Increase Budget for Better Performance' })
  @IsString()
  title: string;

  @ApiProperty({ example: 'Your campaign is performing well. Consider increasing the daily budget by $20 to reach more potential customers.' })
  @IsString()
  description: string;

  @ApiProperty({ example: { action: 'increase_budget', amount: 20 }, required: false })
  @IsOptional()
  @IsObject()
  action?: any;

  @ApiProperty({ example: 'campaign-id', required: false })
  @IsOptional()
  @IsString()
  campaignId?: string;

  @ApiProperty({ example: true, required: false })
  @IsOptional()
  @IsBoolean()
  aiGenerated?: boolean;
}
