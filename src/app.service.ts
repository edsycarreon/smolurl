import { HttpStatus, Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { ApiResponse } from 'src/common/api-response';
import commonConfig from 'src/config/common.config';
import { DatabaseService } from 'src/database/database.service';
import { CreateLinkDTO } from 'src/dto';
import {
  comparePasswords,
  generateRandomCharacters,
  hashPassword,
} from 'src/utils';

@Injectable()
export class AppService {
  constructor(
    @Inject(commonConfig.KEY)
    private readonly config: ConfigType<typeof commonConfig>,
    private readonly databaseService: DatabaseService,
  ) {}

  public async createLink(id: number, body: CreateLinkDTO) {
    Logger.log('Creating link');
    const { longUrl, customUrl, expiresIn, password } = body;

    let hashedPassword = null;
    if (password) {
      hashedPassword = await hashPassword(password);
    }

    let shortUrl = null;
    shortUrl = customUrl;
    if (!customUrl) {
      shortUrl = await this.generateUniqueShortUrl(7);
    } else {
      const existingUrl = await this.checkIfCustomUrlExists(shortUrl);
      if (existingUrl) {
        return new ApiResponse<any>(
          HttpStatus.BAD_REQUEST,
          'Custom URL already exists',
        );
      }
    }

    let query;
    let values;
    if (expiresIn) {
      query = `
            INSERT INTO link (person_id, original_url, short_url, expires_in, password) 
            VALUES ($1, $2, $3, NOW() + $4::interval, $5)`;
      values = [id, longUrl, shortUrl, expiresIn, hashedPassword];
    } else {
      query = `
            INSERT INTO link (person_id, original_url, short_url, password) 
            VALUES ($1, $2, $3, $4)`;
      values = [id, longUrl, shortUrl, hashedPassword];
    }

    const response = await this.databaseService.query(query, values);

    if (!response) {
      return new ApiResponse<any>(
        HttpStatus.INTERNAL_SERVER_ERROR,
        'Something went wrong while creating the URL.',
      );
    }

    return new ApiResponse<any>(
      HttpStatus.CREATED,
      'Link created successfully',
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

  public async getProtectedUrl(shortUrl: string, password: string) {
    Logger.log('Getting protected URL for: ' + shortUrl);
    const link = await this.getUrl(shortUrl);

    if (link.rows.length === 0) {
      return { status: HttpStatus.NOT_FOUND, message: 'Link not found' };
    }

    if (link.rows[0].expires_in < new Date()) {
      return { status: HttpStatus.GONE, message: 'Link has expired' };
    }

    const hashedPassword = link.rows[0].password;
    const isPasswordMatched = await comparePasswords(password, hashedPassword);
    if (!isPasswordMatched) {
      return {
        status: HttpStatus.UNAUTHORIZED,
        message: 'Incorrect password',
      };
    }

    return { status: HttpStatus.OK, url: link.rows[0].original_url };
  }

  private async generateUniqueShortUrl(maxLength: number): Promise<string> {
    let uniqueUrlFound = false;
    let shortUrl = '';
    while (!uniqueUrlFound) {
      shortUrl = generateRandomCharacters(maxLength);
      uniqueUrlFound = !(await this.checkIfCustomUrlExists(shortUrl));
    }
    return shortUrl;
  }

  private async checkIfCustomUrlExists(customUrl: string) {
    const query = `SELECT * FROM link WHERE short_url = $1`;
    const values = [customUrl];
    const response = await this.databaseService.query(query, values);

    return response.rows.length > 0;
  }

  private async getUrl(customUrl: string) {
    const query = `SELECT * FROM link WHERE short_url = $1`;
    const values = [customUrl];
    const response = await this.databaseService.query(query, values);

    return response;
  }
}
