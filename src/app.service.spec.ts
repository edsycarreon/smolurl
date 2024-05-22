import { Test, TestingModule } from '@nestjs/testing';
import { AppService } from './app.service';
import { ConfigType } from '@nestjs/config';
import { HttpStatus } from '@nestjs/common';
import { DatabaseService } from './database/database.service';
import commonConfig from './config/common.config';
import {
  comparePasswords,
  generateRandomCharacters,
  hashPassword,
} from './utils';

jest.mock('./database/database.service', () => ({
  DatabaseService: jest.fn().mockImplementation(() => ({
    query: jest.fn(),
  })),
}));
jest.mock('./utils', () => ({
  hashPassword: jest.fn(),
  generateRandomCharacters: jest.fn(),
  comparePasswords: jest.fn(),
}));

describe('AppService', () => {
  let service: AppService;
  let databaseService: DatabaseService;
  let mockConfig: ConfigType<typeof commonConfig>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AppService,
        {
          provide: commonConfig.KEY,
          useValue: { baseUrl: 'http://localhost:3000' },
        },
        DatabaseService,
      ],
    }).compile();

    service = module.get<AppService>(AppService);
    databaseService = module.get<DatabaseService>(DatabaseService);
    mockConfig = module.get<ConfigType<typeof commonConfig>>(commonConfig.KEY);

    jest.clearAllMocks();
  });

  it('should create a new link successfully without a custom URL', async () => {
    const body = {
      longUrl: 'https://example.com',
      expiresIn: '1 day',
      password: '12345',
    };
    const id = 1;
    const expectedShortUrl = 'abc123';

    (hashPassword as jest.Mock).mockResolvedValue('hashed_password');
    (generateRandomCharacters as jest.Mock).mockReturnValue(expectedShortUrl);
    (databaseService.query as jest.Mock).mockResolvedValue({
      rows: [],
      rowCount: 1,
    });

    const result = await service.createLink(id, body);

    expect(hashPassword).toHaveBeenCalledWith('12345');
    expect(generateRandomCharacters).toHaveBeenCalledWith(7);
    expect(databaseService.query).toHaveBeenCalled();
    expect(result.status).toBe(HttpStatus.CREATED);
    expect(result.data).toEqual({
      shortUrl: mockConfig.baseUrl + '/' + expectedShortUrl,
    });
  });

  describe('getLongUrl', () => {
    const shortUrl = 'abc123';

    it('should return not found if no link exists', async () => {
      (databaseService.query as jest.Mock).mockResolvedValue({
        rows: [],
        rowCount: 0,
      });

      const result = await service.getLongUrl(shortUrl);

      expect(databaseService.query).toHaveBeenCalledWith(expect.any(String), [
        shortUrl,
      ]);
      expect(result.status).toBe(HttpStatus.NOT_FOUND);
      expect(result.message).toBe('Link not found');
    });

    it('should return gone if the link has expired', async () => {
      const expiredDate = new Date(new Date().getTime() - 10000); // 10 seconds ago
      (databaseService.query as jest.Mock).mockResolvedValue({
        rows: [{ expires_in: expiredDate }],
        rowCount: 1,
      });

      const result = await service.getLongUrl(shortUrl);

      expect(result.status).toBe(HttpStatus.GONE);
      expect(result.message).toBe('Link has expired');
    });

    it('should return unauthorized if the link is password protected', async () => {
      (databaseService.query as jest.Mock).mockResolvedValue({
        rows: [{ password: 'hashed_password' }],
        rowCount: 1,
      });

      const result = await service.getLongUrl(shortUrl);

      expect(result.status).toBe(HttpStatus.UNAUTHORIZED);
      expect(result.message).toBe('Link is password protected');
      expect(result.data).toBe(shortUrl);
    });

    it('should return the original URL successfully', async () => {
      const originalUrl = 'https://example.com';
      (databaseService.query as jest.Mock).mockResolvedValue({
        rows: [{ original_url: originalUrl, expires_in: null, password: null }],
        rowCount: 1,
      });

      const result = await service.getLongUrl(shortUrl);

      expect(result.status).toBe(HttpStatus.OK);
      expect(result.message).toBe('Success');
      expect(result.data).toBe(originalUrl);
    });
  });

  describe('getProtectedUrl', () => {
    const shortUrl = 'abc123';
    const password = 'testPassword';

    it('should return not found if no link exists', async () => {
      (databaseService.query as jest.Mock).mockResolvedValue({
        rows: [],
        rowCount: 0,
      });

      const result = await service.getProtectedUrl(shortUrl, password);

      expect(databaseService.query).toHaveBeenCalledWith(expect.any(String), [
        shortUrl,
      ]);
      expect(result.status).toBe(HttpStatus.NOT_FOUND);
      expect(result.message).toBe('Link not found');
    });

    it('should return gone if the link has expired', async () => {
      const expiredDate = new Date(new Date().getTime() - 10000); // 10 seconds ago
      (databaseService.query as jest.Mock).mockResolvedValue({
        rows: [{ expires_in: expiredDate }],
        rowCount: 1,
      });

      const result = await service.getProtectedUrl(shortUrl, password);

      expect(result.status).toBe(HttpStatus.GONE);
      expect(result.message).toBe('Link has expired');
    });

    it('should return unauthorized if the link is password protected', async () => {
      (databaseService.query as jest.Mock).mockResolvedValue({
        rows: [{ password: 'hashed_password' }],
        rowCount: 1,
      });

      const result = await service.getLongUrl(shortUrl);

      expect(result.status).toBe(HttpStatus.UNAUTHORIZED);
      expect(result.message).toBe('Link is password protected');
      expect(result.data).toBe(shortUrl);
    });

    it('should return the original URL successfully when the password is correct', async () => {
      const originalUrl = 'https://example.com';
      (databaseService.query as jest.Mock).mockResolvedValue({
        rows: [{ original_url: originalUrl, password: 'hashed_password' }],
        rowCount: 1,
      });
      (comparePasswords as jest.Mock).mockResolvedValue(true);

      const result = await service.getProtectedUrl(shortUrl, password);

      expect(comparePasswords).toHaveBeenCalledWith(
        password,
        'hashed_password',
      );
      expect(result.status).toBe(HttpStatus.OK);
      expect(result.message).toBe('Success');
      expect(result.data).toBe(originalUrl);
    });
  });

  describe('Private methods', () => {
    describe('generateUniqueShortUrl', () => {
      it('should generate a unique short URL', async () => {
        (generateRandomCharacters as jest.Mock)
          .mockReturnValueOnce('random1')
          .mockReturnValueOnce('random2');
        (databaseService.query as jest.Mock)
          .mockResolvedValueOnce({
            rows: [{ short_url: 'random1' }],
            rowCount: 1,
          }) // First call, URL exists
          .mockResolvedValueOnce({ rows: [], rowCount: 0 }); // Second call, URL does not exist

        const result = await service['generateUniqueShortUrl'](7);

        expect(generateRandomCharacters).toHaveBeenCalledTimes(2);
        expect(databaseService.query).toHaveBeenCalledTimes(2);
        expect(result).toBe('random2');
      });
    });

    describe('checkIfCustomUrlExists', () => {
      it('should return true if custom URL exists', async () => {
        (databaseService.query as jest.Mock).mockResolvedValue({
          rows: [{ short_url: 'exists' }],
          rowCount: 1,
        });

        const result = await service['checkIfCustomUrlExists']('exists');

        expect(databaseService.query).toHaveBeenCalledWith(
          `SELECT * FROM link WHERE short_url = $1`,
          ['exists'],
        );
        expect(result).toBe(true);
      });

      it('should return false if custom URL does not exist', async () => {
        (databaseService.query as jest.Mock).mockResolvedValue({
          rows: [],
          rowCount: 0,
        });

        const result = await service['checkIfCustomUrlExists']('notexists');

        expect(databaseService.query).toHaveBeenCalledWith(
          `SELECT * FROM link WHERE short_url = $1`,
          ['notexists'],
        );
        expect(result).toBe(false);
      });
    });

    describe('getUrl', () => {
      it('should retrieve a URL', async () => {
        const expectedResponse = {
          rows: [{ original_url: 'https://example.com' }],
          rowCount: 1,
        };
        (databaseService.query as jest.Mock).mockResolvedValue(
          expectedResponse,
        );

        const result = await service['getUrl']('abc123');

        expect(databaseService.query).toHaveBeenCalledWith(
          `SELECT * FROM link WHERE short_url = $1`,
          ['abc123'],
        );
        expect(result).toEqual(expectedResponse);
      });
    });
  });
});
