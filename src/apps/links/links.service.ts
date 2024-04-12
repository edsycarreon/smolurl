import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { ApiResponse } from 'src/common/api-response';
import commonConfig from 'src/config/common.config';
import { DatabaseService } from 'src/database/database.service';
import { CreateLinkDTO } from 'src/dto';
import { hashPassword } from 'src/utils';

@Injectable()
export class LinksService {
  constructor(
    @Inject(commonConfig.KEY)
    private readonly config: ConfigType<typeof commonConfig>,
    private readonly databaseService: DatabaseService,
    private readonly jwtService: JwtService,
  ) {}

  async createLink(id: number, body: CreateLinkDTO) {
    const { longUrl, customUrl, expiresIn, password } = body;

    let hashedPassword = '';
    let shortUrl = '';
    if (password) {
      hashedPassword = await hashPassword(password);
    }

    if (customUrl) {
      const randomSeed = this.generateRandomUrlSeed();
      const domain = this.config.baseUrl;
      shortUrl = `${domain}/${randomSeed}`;
      console.log('shortUrl', shortUrl);
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
    const query = `SELECT * FROM link WHERE custom_url = $1`;
    const values = [customUrl];
    const response = await this.databaseService.query(query, values);

    return response.rows.length > 0;
  }

  generateRandomUrlSeed() {
    const characters =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;
    let result = '';
    for (let i = 0; i < 7; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
  }
}
