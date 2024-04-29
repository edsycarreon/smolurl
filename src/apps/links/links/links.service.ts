import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import { ApiResponse } from 'src/common/api-response';
import { castLinkDto } from 'src/common/casts';
import { DatabaseService } from 'src/database/database.service';
import { LinkDTO } from 'src/dto';
import { castToArray } from 'src/utils';

@Injectable()
export class LinksService {
  constructor(private readonly databaseService: DatabaseService) {}

  public async getLinks(id: number, page: number, limit: number) {
    Logger.log('Getting URLs for: ' + id);
    const offset = (page - 1) * limit;

    const query = `SELECT * FROM link WHERE person_id = $1 LIMIT $2 OFFSET $3`;
    const values = [id, limit, offset];

    const response = await this.databaseService.query(query, values);
    const links: LinkDTO[] = castToArray(response.rows).map(castLinkDto);

    return new ApiResponse<LinkDTO[]>(HttpStatus.OK, 'Links retrieved', links);
  }
}
