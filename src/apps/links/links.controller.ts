import { Body, Controller, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { LinksService } from './links.service';
import { CreateLinkDTO, CustomerDTO } from 'src/dto';
import { CurrentUser } from 'src/common/decorators';

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
}
