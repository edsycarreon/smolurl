import { IsOptional, IsString } from 'class-validator';
import { BaseDTO } from './base.dto';

export class CreateLinkDTO extends BaseDTO {
  @IsString()
  longUrl: string;

  @IsOptional()
  customUrl?: string;

  @IsOptional()
  expiresIn?: string;

  @IsOptional()
  password?: string;
}
