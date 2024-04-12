import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ApiResponse } from 'src/common/api-response';
import { DatabaseService } from 'src/database/database.service';
import { CreateLinkDTO } from 'src/dto';
import { hashPassword } from 'src/utils';

@Injectable()
export class LinksService {
  constructor(
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
      const domain = 'smolapp.edsybitsy.com';
      shortUrl = `${domain}/${randomSeed}`;
      console.log('shortUrl', shortUrl);
    }

    const query = `
      INSERT INTO link (person_id, original_url, short_url, expires_in, password) 
      VALUES ($1, $2, $3, NOW() + $4::interval, $5)`;

    const values = [id, longUrl, shortUrl, expiresIn, hashedPassword];
    const response = await this.databaseService.query(query, values);

    if (response) {
      console.log('response');
    }

    return 'Create link';
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
