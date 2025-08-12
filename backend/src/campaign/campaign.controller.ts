import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

import { CampaignService } from './campaign.service';
import { CreateCampaignDto } from './dto/create-campaign.dto';
import { UpdateCampaignDto } from './dto/update-campaign.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Campaigns')
@Controller('campaigns')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class CampaignController {
  constructor(private readonly campaignService: CampaignService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new campaign' })
  @ApiResponse({ status: 201, description: 'Campaign created successfully' })
  create(@Request() req, @Body() createCampaignDto: CreateCampaignDto) {
    return this.campaignService.create(req.user.id, createCampaignDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all campaigns for the user' })
  @ApiResponse({ status: 200, description: 'Campaigns retrieved successfully' })
  findAll(@Request() req) {
    return this.campaignService.findAll(req.user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get campaign by ID' })
  @ApiResponse({ status: 200, description: 'Campaign retrieved successfully' })
  findOne(@Request() req, @Param('id') id: string) {
    return this.campaignService.findOne(req.user.id, id);
  }

  @Get(':id/performance')
  @ApiOperation({ summary: 'Get campaign performance data' })
  @ApiResponse({ status: 200, description: 'Performance data retrieved successfully' })
  getPerformance(
    @Request() req,
    @Param('id') id: string,
    @Query('days') days: string = '30',
  ) {
    return this.campaignService.getPerformance(req.user.id, id, parseInt(days));
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update campaign' })
  @ApiResponse({ status: 200, description: 'Campaign updated successfully' })
  update(
    @Request() req,
    @Param('id') id: string,
    @Body() updateCampaignDto: UpdateCampaignDto,
  ) {
    return this.campaignService.update(req.user.id, id, updateCampaignDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete campaign' })
  @ApiResponse({ status: 200, description: 'Campaign deleted successfully' })
  remove(@Request() req, @Param('id') id: string) {
    return this.campaignService.remove(req.user.id, id);
  }
}
