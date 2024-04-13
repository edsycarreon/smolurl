import {
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  Logger,
} from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { ApiResponse } from 'src/common/api-response';
import commonConfig from 'src/config/common.config';
import { DatabaseService } from 'src/database/database.service';
import { CreateLinkDTO } from 'src/dto';
import { generateRandomCharacters, hashPassword } from 'src/utils';

@Injectable()
export class LinksService {
  constructor(
    @Inject(commonConfig.KEY)
    private readonly config: ConfigType<typeof commonConfig>,
    private readonly databaseService: DatabaseService,
  ) {}

  public async createLink(id: number, body: CreateLinkDTO) {
    Logger.log('Creating link');
    const { longUrl, customUrl, expiresIn, password } = body;

    let hashedPassword = '';
    let shortUrl = '';
    if (password) {
      hashedPassword = await hashPassword(password);
    }

    if (customUrl) {
      let uniqueUrlFound = false;
      while (!uniqueUrlFound) {
        const randomSeed = generateRandomCharacters(7);
        const existingUrl = await this.checkIfCustomUrlExists(randomSeed);
        if (!existingUrl) {
          shortUrl = randomSeed;
          uniqueUrlFound = true;
        }
      }
    }

    const query = `
      INSERT INTO link (person_id, original_url, short_url, expires_in, password) 
      VALUES ($1, $2, $3, NOW() + $4::interval, $5)`;

    const values = [id, longUrl, shortUrl, expiresIn, hashedPassword];

    const response = await this.databaseService.query(query, values);
    if (!response) {
      new ApiResponse<any>(
        HttpStatus.INTERNAL_SERVER_ERROR,
        'Error creating account',
        null,
      );
    }

    return new ApiResponse<any>(
      HttpStatus.CREATED,
      'Link created successfully',
      null,
      { shortUrl: this.config.baseUrl + '/' + shortUrl },
    );
  }

  public async getLongUrl(shortUrl: string) {
    Logger.log('Getting long URL for: ' + shortUrl);
    const link = await this.getUrl(shortUrl);

    if (link.rows.length === 0) {
      return { status: HttpStatus.NOT_FOUND, message: 'Link not found' };
    }

    if (link.rows[0].expires_in < new Date()) {
      return { status: HttpStatus.GONE, message: 'Link has expired' };
    }

    if (link.rows[0].password != null) {
      return {
        status: HttpStatus.UNAUTHORIZED,
        message: 'Link is password protected',
      };
    }

    return { status: HttpStatus.OK, url: link.rows[0].original_url };
  }

  async checkIfCustomUrlExists(customUrl: string) {
    const query = `SELECT * FROM link WHERE short_url = $1`;
    const values = [customUrl];
    const response = await this.databaseService.query(query, values);

    return response.rows.length > 0;
  }

  async getUrl(customUrl: string) {
    const query = `SELECT * FROM link WHERE short_url = $1`;
    const values = [customUrl];
    const response = await this.databaseService.query(query, values);

    return response;
  }
}
