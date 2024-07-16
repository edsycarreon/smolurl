import { Controller, Delete, Get, Param, Patch, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { LinksService } from './links.service';
import { CustomerDTO } from '../../dto';
import { CurrentUser } from '../../common/decorators';

@ApiTags('links')
@Controller('links')
export class LinksController {
  constructor(private readonly linkService: LinksService) {}

  @Get('get')
  public async getUserLinks(
    @CurrentUser() user: CustomerDTO,
    @Query('page') page = 1,
    @Query('limit') limit = 20,
  ) {
    return this.linkService.getUserLinks(user.id, page, limit);
  }

  @Patch(':shortUrl')
  public async updateLinkView(@Query('shortUrl') shortUrl: string) {
    return this.linkService.updateLinkView(shortUrl);
  }

  @Delete(':shortUrl')
  public async deleteLink(@Param('shortUrl') shortUrl: string) {
    console.log(shortUrl);
    return this.linkService.deleteLink(shortUrl);
  }
}
