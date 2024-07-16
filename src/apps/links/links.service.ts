import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import { LinkDTO } from '../../dto';
import { castToArray } from '../../utils';
import { castLinkDto } from '../../common/casts';
import { ApiResponse } from '../../common/api-response';

@Injectable()
export class LinksService {
  constructor(private readonly databaseService: DatabaseService) {}

  public async getUserLinks(id: number, page: number, limit: number) {
    Logger.log('Getting URLs for: ' + id);
    if (!limit) {
      limit = 10;
    }
    const offset = (page - 1) * limit;

    const query = `SELECT * FROM link 
      WHERE person_id = $1 
      ORDER BY added_at DESC 
      LIMIT $2 
      OFFSET $3`;
    const values = [id, limit, offset];

    const response = await this.databaseService.query(query, values);
    const links: LinkDTO[] = castToArray(response.rows).map(castLinkDto);

    return new ApiResponse<LinkDTO[]>(HttpStatus.OK, 'Links retrieved', links);
  }

  public async updateLinkView(shortUrl: string) {
    Logger.log('Updating view count for: ' + shortUrl);
    const query = `UPDATE link SET visit_count = visit_count + 1, last_redirect = NOW(), updated_at = NOW() WHERE short_url = $1`;
    const values = [shortUrl];

    const response = await this.databaseService.query(query, values);

    if (!response) {
      return new ApiResponse<any>(HttpStatus.NOT_FOUND, 'Link not found');
    }

    return new ApiResponse<any>(HttpStatus.OK, 'Link updated');
  }

  public async deleteLink(shortUrl: string) {
    Logger.log('Deleting link: ' + shortUrl);
    const query = `DELETE FROM link WHERE short_url = $1`;
    const values = [shortUrl];

    const response = await this.databaseService.query(query, values);

    if (!response) {
      return new ApiResponse<any>(HttpStatus.NOT_FOUND, 'Link not found');
    }

    return new ApiResponse<any>(HttpStatus.OK, 'Link deleted');
  }
}
