import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { LinksService } from './links.service';
import { CurrentUser } from 'src/common/decorators';
import { CustomerDTO } from 'src/dto';

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
}
