import { IsNumber, IsOptional, IsString } from 'class-validator';
import { BaseDTO } from './base.dto';
import { ApiProperty } from '@nestjs/swagger';

export class CustomerDTO extends BaseDTO {
  @IsOptional()
  @IsNumber()
  @ApiProperty()
  id?: number;

  @IsOptional()
  @IsString()
  @ApiProperty()
  firstName?: string;

  @IsOptional()
  @IsString()
  @ApiProperty()
  lastName?: string;

  @IsOptional()
  @IsString()
  @ApiProperty()
  email?: string;

  @IsOptional()
  @IsString()
  password?: string;

  @IsOptional()
  @IsString()
  @ApiProperty()
  addedAt?: string;

  @IsOptional()
  @IsString()
  @ApiProperty()
  updatedAt?: string;
}
