import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Post,
  Res,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AppService } from './app.service';
import { CreateLinkDTO, CustomerDTO } from './dto';
import { CurrentUser, Public } from './common/decorators';
import { Response } from 'express';
import { ApiResponse } from './common/api-response';
import { InvalidCredentials } from './common/errors';
import { ConfigService } from '@nestjs/config';

@ApiTags('App')
@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly configService: ConfigService,
  ) {}

  @Post('/')
  async createLink(
    @CurrentUser() user: CustomerDTO,
    @Body() body: CreateLinkDTO,
  ) {
    return this.appService.createLink(user.id, body);
  }

  @Public()
  @Get('/:shortUrl')
  async getLongUrl(@Param('shortUrl') shortUrl: string, @Res() res: Response) {
    const result = await this.appService.getLongUrl(shortUrl);
    const frontendUrl = this.configService.get<string>('FRONTEND_BASE_URL');
    switch (result.status) {
      case HttpStatus.OK:
        return res.redirect(result.data);
      case HttpStatus.UNAUTHORIZED:
        return res.redirect(`${frontendUrl}/password-protected/${result.data}`);
      case HttpStatus.NOT_FOUND:
        return res.redirect(`${frontendUrl}/404`);
      case HttpStatus.GONE:
        return res.redirect(`${frontendUrl}/expired`);
      default:
        return res
          .status(HttpStatus.INTERNAL_SERVER_ERROR)
          .send('An unexpected error occurred');
    }
  }

  @Public()
  @Post('/protected')
  async getProtectedUrl(@Body() body: { shortUrl: string; password: string }) {
    const result = await this.appService.getProtectedUrl(
      body.shortUrl,
      body.password,
    );

    switch (result.status) {
      case HttpStatus.OK:
        return new ApiResponse<any>(
          HttpStatus.OK,
          'URL retrieved successfully',
          result.data,
        );
      case HttpStatus.NOT_FOUND:
        throw new HttpException(
          new ApiResponse<any>(HttpStatus.NOT_FOUND, 'URL not found'),
          HttpStatus.NOT_FOUND,
        );
      case HttpStatus.GONE:
        throw new HttpException(
          new ApiResponse<any>(HttpStatus.GONE, 'URL has expired'),
          HttpStatus.GONE,
        );
      case HttpStatus.UNAUTHORIZED:
        throw new InvalidCredentials();
      default:
        throw new HttpException(
          new ApiResponse<any>(
            HttpStatus.INTERNAL_SERVER_ERROR,
            'An error occurred while retrieving the URL.',
          ),
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
    }
  }
}
