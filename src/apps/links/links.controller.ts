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
import { LinksService } from './links.service';
import { CreateLinkDTO, CustomerDTO } from 'src/dto';
import { CurrentUser } from 'src/common/decorators';
import { Response } from 'express';

@ApiTags('links')
@Controller('links')
export class LinksController {
  constructor(private readonly linksService: LinksService) {}

  @Post('/')
  async createLink(
    @CurrentUser() user: CustomerDTO,
    @Body() body: CreateLinkDTO,
  ) {
    return this.linksService.createLink(user.id, body);
  }

  @Get('/:shortUrl')
  async getLongUrl(@Param('shortUrl') shortUrl: string, @Res() res: Response) {
    const result = await this.linksService.getLongUrl(shortUrl);

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
