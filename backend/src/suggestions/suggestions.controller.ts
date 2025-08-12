import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

import { SuggestionsService } from './suggestions.service';
import { CreateSuggestionDto } from './dto/create-suggestion.dto';
import { UpdateSuggestionDto } from './dto/update-suggestion.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Suggestions')
@Controller('suggestions')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class SuggestionsController {
  constructor(private readonly suggestionsService: SuggestionsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new suggestion' })
  @ApiResponse({ status: 201, description: 'Suggestion created successfully' })
  create(@Request() req, @Body() createSuggestionDto: CreateSuggestionDto) {
    return this.suggestionsService.create(req.user.id, createSuggestionDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all suggestions for the user' })
  @ApiResponse({ status: 200, description: 'Suggestions retrieved successfully' })
  findAll(@Request() req) {
    return this.suggestionsService.findAll(req.user.id);
  }

  @Get('pending')
  @ApiOperation({ summary: 'Get pending suggestions' })
  @ApiResponse({ status: 200, description: 'Pending suggestions retrieved successfully' })
  getPendingSuggestions(@Request() req) {
    return this.suggestionsService.getPendingSuggestions(req.user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get suggestion by ID' })
  @ApiResponse({ status: 200, description: 'Suggestion retrieved successfully' })
  findOne(@Request() req, @Param('id') id: string) {
    return this.suggestionsService.findOne(req.user.id, id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update suggestion' })
  @ApiResponse({ status: 200, description: 'Suggestion updated successfully' })
  update(
    @Request() req,
    @Param('id') id: string,
    @Body() updateSuggestionDto: UpdateSuggestionDto,
  ) {
    return this.suggestionsService.update(req.user.id, id, updateSuggestionDto);
  }

  @Post(':id/approve')
  @ApiOperation({ summary: 'Approve suggestion' })
  @ApiResponse({ status: 200, description: 'Suggestion approved successfully' })
  approve(@Request() req, @Param('id') id: string) {
    return this.suggestionsService.approve(req.user.id, id);
  }

  @Post(':id/reject')
  @ApiOperation({ summary: 'Reject suggestion' })
  @ApiResponse({ status: 200, description: 'Suggestion rejected successfully' })
  reject(@Request() req, @Param('id') id: string) {
    return this.suggestionsService.reject(req.user.id, id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete suggestion' })
  @ApiResponse({ status: 200, description: 'Suggestion deleted successfully' })
  remove(@Request() req, @Param('id') id: string) {
    return this.suggestionsService.remove(req.user.id, id);
  }
}
