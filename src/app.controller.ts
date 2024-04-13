import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Param,
  Post,
  Res,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AppService } from './app.service';
import { CreateLinkDTO, CustomerDTO } from 'src/dto';
import { CurrentUser } from 'src/common/decorators';
import { Response } from 'express';

@ApiTags('App')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Post('/')
  async createLink(
    @CurrentUser() user: CustomerDTO,
    @Body() body: CreateLinkDTO,
  ) {
    return this.appService.createLink(user.id, body);
  }

  @Get('/:shortUrl')
  async getLongUrl(@Param('shortUrl') shortUrl: string, @Res() res: Response) {
    const result = await this.appService.getLongUrl(shortUrl);

    switch (result.status) {
      case HttpStatus.OK:
        return res.redirect(result.url);
      case HttpStatus.NOT_FOUND:
        return res
          .status(HttpStatus.NOT_FOUND)
          .send('404 Not Found screen or URL');
      case HttpStatus.GONE:
        return res.status(HttpStatus.GONE).send('Link expired');
      case HttpStatus.UNAUTHORIZED:
        return res
          .status(HttpStatus.UNAUTHORIZED)
          .send('Password protected link message or URL');
      default:
        return res
          .status(HttpStatus.INTERNAL_SERVER_ERROR)
          .send('An unexpected error occurred');
    }
  }
}
