import { IsNumber, IsOptional, IsString, MaxLength } from 'class-validator';
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

export class LinkDTO extends BaseDTO {
  @IsString()
  linkId: string;

  @IsString()
  shortUrl: string;

  @IsString()
  originalUrl: string;

  @IsNumber()
  @IsOptional()
  visitCount: number;

  @IsString()
  @IsOptional()
  expiresIn: string;

  @IsString()
  @IsOptional()
  lastRedirect: string;
}
