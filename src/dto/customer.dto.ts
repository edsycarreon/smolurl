import { IsNumber, IsOptional, IsString } from 'class-validator';
import { BaseDTO } from './base.dto';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CustomerDTO extends BaseDTO {
  @IsOptional()
  @IsNumber()
  @ApiPropertyOptional()
  id?: number;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional()
  firstName?: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional()
  lastName?: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional()
  email?: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional()
  addedAt?: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional()
  updatedAt?: string;
}
