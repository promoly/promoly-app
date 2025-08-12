import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSuggestionDto } from './dto/create-suggestion.dto';
import { UpdateSuggestionDto } from './dto/update-suggestion.dto';

@Injectable()
export class SuggestionsService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, createSuggestionDto: CreateSuggestionDto) {
    return this.prisma.suggestion.create({
      data: {
        ...createSuggestionDto,
        userId,
      },
    });
  }

  async findAll(userId: string) {
    return this.prisma.suggestion.findMany({
      where: { userId },
      include: {
        campaign: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(userId: string, id: string) {
    const suggestion = await this.prisma.suggestion.findFirst({
      where: { id, userId },
      include: {
        campaign: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!suggestion) {
      throw new NotFoundException('Suggestion not found');
    }

    return suggestion;
  }

  async update(userId: string, id: string, updateSuggestionDto: UpdateSuggestionDto) {
    await this.findOne(userId, id);

    return this.prisma.suggestion.update({
      where: { id },
      data: updateSuggestionDto,
    });
  }

  async approve(userId: string, id: string) {
    const suggestion = await this.findOne(userId, id);

    // Update suggestion status
    await this.prisma.suggestion.update({
      where: { id },
      data: { status: 'APPROVED' },
    });

    // If suggestion has an action, execute it
    if (suggestion.action) {
      // This would typically trigger a background job to implement the suggestion
      console.log('Executing suggestion action:', suggestion.action);
    }

    return { success: true, message: 'Suggestion approved and will be implemented' };
  }

  async reject(userId: string, id: string) {
    await this.findOne(userId, id);

    return this.prisma.suggestion.update({
      where: { id },
      data: { status: 'REJECTED' },
    });
  }

  async remove(userId: string, id: string) {
    await this.findOne(userId, id);

    return this.prisma.suggestion.delete({
      where: { id },
    });
  }

  async getPendingSuggestions(userId: string) {
    return this.prisma.suggestion.findMany({
      where: { 
        userId, 
        status: 'PENDING' 
      },
      include: {
        campaign: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}
