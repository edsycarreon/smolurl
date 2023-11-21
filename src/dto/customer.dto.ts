import { IsOptional, IsString } from 'class-validator';
import { BaseDTO } from './base.dto';

export class CustomerDTO extends BaseDTO {
  @IsOptional()
  @IsOptional()
  id?: number;

  @IsOptional()
  @IsString()
  firstName?: string;

  @IsOptional()
  @IsString()
  lastName?: string;

  @IsOptional()
  @IsString()
  email?: string;

  @IsOptional()
  @IsString()
  addedAt?: string;

  @IsOptional()
  @IsString()
  updatedAt?: string;
}
