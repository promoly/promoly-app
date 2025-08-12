import { Controller, Post, Get, Body, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

import { MetaIntegrationService } from './meta-integration.service';
import { CreateMetaAccountDto } from './dto/create-meta-account.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Meta Integration')
@Controller('meta')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class MetaIntegrationController {
  constructor(private readonly metaIntegrationService: MetaIntegrationService) {}

  @Post('connect')
  @ApiOperation({ summary: 'Connect Meta Ads account' })
  @ApiResponse({ status: 201, description: 'Meta account connected successfully' })
  async connectAccount(@Request() req, @Body() createMetaAccountDto: CreateMetaAccountDto) {
    return this.metaIntegrationService.createMetaAccount(req.user.id, createMetaAccountDto);
  }

  @Get('accounts')
  @ApiOperation({ summary: 'Get user Meta accounts' })
  @ApiResponse({ status: 200, description: 'Meta accounts retrieved successfully' })
  async getAccounts(@Request() req) {
    return this.metaIntegrationService.getMetaAccounts(req.user.id);
  }
}
