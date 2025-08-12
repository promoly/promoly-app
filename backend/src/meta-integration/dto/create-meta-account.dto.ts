import { IsString, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateMetaAccountDto {
  @ApiProperty({ example: 'act_123456789' })
  @IsString()
  adAccountId: string;

  @ApiProperty({ example: 'EAAG...' })
  @IsString()
  accessToken: string;

  @ApiProperty({ example: 'My Business Account', required: false })
  @IsOptional()
  @IsString()
  accountName?: string;
}
