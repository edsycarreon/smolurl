import { Controller, Get, Patch, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { LinksService } from './links.service';
import { CustomerDTO } from '../../dto';
import { CurrentUser } from '../../common/decorators';

@ApiTags('links')
@Controller('links')
export class LinksController {
  constructor(private readonly linkService: LinksService) {}

  @Get('get')
  public async getLinks(
    @CurrentUser() user: CustomerDTO,
    @Query('page') page = 1,
    @Query('limit') limit = 10,
  ) {
    return this.linkService.getLinks(user.id, page, limit);
  }

  @Patch(':shortUrl')
  public async updateLinkView(@Query('shortUrl') shortUrl: string) {
    return this.linkService.updateLinkView(shortUrl);
  }
}
