import { IsOptional, IsString } from 'class-validator';

export class BaseDTO {
  @IsOptional()
  @IsString()
  addedAt?: string;

  @IsOptional()
  @IsString()
  updatedAt?: string;
}
