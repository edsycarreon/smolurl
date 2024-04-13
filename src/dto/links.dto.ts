import { IsOptional, IsString, MaxLength } from 'class-validator';
import { BaseDTO } from './base.dto';

export class CreateLinkDTO extends BaseDTO {
  @IsString()
  longUrl: string;

  @IsOptional()
  @MaxLength(7)
  customUrl?: string;

  @IsOptional()
  expiresIn?: string;

  @IsOptional()
  password?: string;
}
