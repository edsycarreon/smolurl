import { AuthService } from './auth.service';
import { DatabaseService } from '../../database/database.service';
import { JwtService } from '@nestjs/jwt';
import { hashPassword } from '../../utils';
import { RegisterAccountDTO } from '../../dto';
import { HttpException, HttpStatus } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

jest.mock('../../database/database.service', () => ({
  DatabaseService: jest.fn().mockImplementation(() => ({
    query: jest.fn(),
  })),
}));
jest.mock('@nestjs/jwt');
jest.mock('../../utils', () => ({
  hashPassword: jest.fn(),
}));

describe('AuthService', () => {
  let authService: AuthService;
  let databaseService: DatabaseService;
  let jwtService: JwtService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AuthService, DatabaseService, JwtService],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    databaseService = module.get<DatabaseService>(DatabaseService);
    jwtService = module.get<JwtService>(JwtService);

    jest.clearAllMocks();
  });

  describe('signUp', () => {
    const registerDto: RegisterAccountDTO = {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      password: 'password123',
    };

    it('should create a new account if email is not in use', async () => {
      jest.spyOn(authService, 'getUserByEmail').mockResolvedValue(null);
      (hashPassword as jest.Mock).mockResolvedValue('hashedPassword');
      const querySpy = jest
        .spyOn(databaseService, 'query')
        .mockResolvedValue(true);

      const result = await authService.signUp(registerDto);

      expect(querySpy).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO person'),
        expect.arrayContaining([
          'John',
          'Doe',
          'john@example.com',
          'hashedPassword',
        ]),
      );
      expect(result.status).toBe(HttpStatus.CREATED);
      expect(result.message).toBe('Account created successfully');
    });

    it('should throw an error if email is already in use', async () => {
      jest
        .spyOn(authService, 'getUserByEmail')
        .mockResolvedValue({ id: 1, email: 'john@example.com' });

      await expect(authService.signUp(registerDto)).rejects.toThrow(
        HttpException,
      );
    });

    it('should handle database errors during account creation', async () => {
      jest.spyOn(authService, 'getUserByEmail').mockResolvedValue(null);
      (hashPassword as jest.Mock).mockResolvedValue('hashedPassword');
      jest.spyOn(databaseService, 'query').mockResolvedValue(null);

      await expect(authService.signUp(registerDto)).rejects.toThrow(
        HttpException,
      );
    });
  });
});
