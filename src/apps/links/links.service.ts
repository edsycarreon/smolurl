import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
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

  async createLink(id: number, body: CreateLinkDTO) {
    const { longUrl, customUrl, expiresIn, password } = body;

    let hashedPassword = '';
    let shortUrl = '';
    if (password) {
      hashedPassword = await hashPassword(password);
    }

    if (customUrl) {
      let uniqueUrlFound = false;
      const domain = this.config.baseUrl;
      while (!uniqueUrlFound) {
        const randomSeed = generateRandomCharacters(7);
        const potentialShortUrl = `${domain}/${randomSeed}`;
        const existingUrl = await this.checkIfCustomUrlExists(
          potentialShortUrl,
        );
        if (!existingUrl) {
          shortUrl = potentialShortUrl;
          uniqueUrlFound = true;
        }
      }
    }

    const query = `
      INSERT INTO link (person_id, original_url, short_url, expires_in, password) 
      VALUES ($1, $2, $3, NOW() + $4::interval, $5)`;

    const values = [id, longUrl, shortUrl, expiresIn, hashedPassword];

    try {
      const response = await this.databaseService.query(query, values);
      if (response) {
        return new ApiResponse<any>(
          HttpStatus.FOUND,
          'Link created successfully',
          null,
          { shortUrl },
        );
      }
    } catch (e) {
      throw new HttpException(
        new ApiResponse<any>(
          HttpStatus.INTERNAL_SERVER_ERROR,
          'Error creating account',
          e,
        ),
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async checkIfCustomUrlExists(customUrl: string) {
    const query = `SELECT * FROM link WHERE short_url = $1`;
    const values = [customUrl];
    const response = await this.databaseService.query(query, values);

    return response.rows.length > 0;
  }
}
