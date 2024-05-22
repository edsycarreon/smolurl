import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Patch,
  Post,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CurrentUser, Public } from '../../common/decorators';
import { AuthService } from './auth.service';
import {
  ChangePasswordDTO,
  CustomerDTO,
  RegisterAccountDTO,
  SignInAccountDTO,
} from '../../dto';
import { ApiResponse } from '../../common/api-response';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('signup')
  async signUp(@Body() body: RegisterAccountDTO): Promise<ApiResponse<any>> {
    return this.authService.signUp(body);
  }

  @Public()
  @HttpCode(HttpStatus.OK)
  @Post('signin')
  async signIn(@Body() body: SignInAccountDTO): Promise<ApiResponse<any>> {
    return this.authService.signIn(body);
  }

  @Patch('change-password')
  async changePassword(
    @CurrentUser() user: CustomerDTO,
    @Body() body: ChangePasswordDTO,
  ): Promise<ApiResponse<any>> {
    return this.authService.changePassword(
      user.id,
      body.password,
      body.newPassword,
    );
  }
}
