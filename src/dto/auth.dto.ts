import { ApiProperty, OmitType, PickType } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class SignInAccountDTO {
  @IsOptional()
  @IsNumber()
  id: number;

  @IsNotEmpty()
  @IsString()
  email: string;

  @IsNotEmpty()
  @IsString()
  password: string;
}

export class RegisterAccountDTO {
  @IsNotEmpty()
  @IsString()
  email: string;

  @IsNotEmpty()
  @IsString()
  password: string;

  @IsNotEmpty()
  @IsString()
  firstName: string;

  @IsNotEmpty()
  @IsString()
  lastName: string;
}

export class ChangePasswordDTO {
  @IsNotEmpty()
  @IsString()
  password: string;

  @IsNotEmpty()
  @IsString()
  newPassword: string;
}

export class BaseAuthLoginDTO {
  @IsString()
  @ApiProperty()
  apiKey: string;

  @IsString()
  @ApiProperty()
  signature: string;

  @IsString()
  @ApiProperty()
  token: string;

  @IsString()
  @ApiProperty()
  name: string;

  @IsNumber()
  @ApiProperty()
  expiresIn: number;
}

export class AuthLoginBodyDTO extends PickType(BaseAuthLoginDTO, [
  'apiKey',
  'signature',
]) {}
export class AuthLoginResponseDTO extends PickType(BaseAuthLoginDTO, [
  'token',
]) {}
export class DecodedTokenDTO extends OmitType(BaseAuthLoginDTO, [
  'token',
  'signature',
]) {}
