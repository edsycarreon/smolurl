import { AuthService } from './auth.service';
import { DatabaseService } from '../../database/database.service';
import { JwtService } from '@nestjs/jwt';
import { comparePasswords, hashPassword } from '../../utils';
import { RegisterAccountDTO, SignInAccountDTO } from '../../dto';
import { HttpException, HttpStatus } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { InvalidCredentials } from '../../common/errors';

jest.mock('../../database/database.service', () => ({
  DatabaseService: jest.fn().mockImplementation(() => ({
    query: jest.fn(),
  })),
}));
jest.mock('@nestjs/jwt');
jest.mock('../../utils', () => ({
  hashPassword: jest.fn(),
  comparePasswords: jest.fn(),
  castToArray: jest
    .fn()
    .mockReturnValue([
      { id: 1, email: 'test@example.com', password: 'hashed' },
    ]),
  castCustomerDto: jest.fn((x) => x),
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

  describe('signIn', () => {
    const signInDto: SignInAccountDTO = {
      email: 'john@example.com',
      password: 'password123',
    };

    it('should successfully sign in and return a token', async () => {
      const user = {
        id: 1,
        email: 'john@example.com',
        password: 'hashedPassword',
      };
      jest.spyOn(authService, 'getUserByEmail').mockResolvedValue(user);
      (comparePasswords as jest.Mock).mockResolvedValue(true);
      const signSpy = jest
        .spyOn(jwtService, 'signAsync')
        .mockResolvedValue('token');

      const result = await authService.signIn(signInDto);

      expect(signSpy).toHaveBeenCalledWith({ user });
      expect(result.status).toBe(HttpStatus.OK);
      expect(result.message).toBe('Login successful');
      expect(result.data).toBe('token');
    });

    it('should throw InvalidCredentials if the email does not exist', async () => {
      jest.spyOn(authService, 'getUserByEmail').mockResolvedValue(null);

      await expect(authService.signIn(signInDto)).rejects.toThrow(
        InvalidCredentials,
      );
    });

    it('should throw InvalidCredentials if the password does not match', async () => {
      const user = {
        id: 1,
        email: 'john@example.com',
        password: 'hashedPassword',
      };
      jest.spyOn(authService, 'getUserByEmail').mockResolvedValue(user);
      (comparePasswords as jest.Mock).mockResolvedValue(false);

      await expect(authService.signIn(signInDto)).rejects.toThrow(
        InvalidCredentials,
      );
    });
  });

  describe('changePassword', () => {
    const userId = 1;
    const currentPassword = 'currentPassword';
    const newPassword = 'newPassword';

    it('should successfully change the password', async () => {
      jest.spyOn(authService, 'getUserById').mockResolvedValue({ id: userId });
      jest
        .spyOn(authService, 'getUserPasswordById')
        .mockResolvedValue(currentPassword);
      (comparePasswords as jest.Mock).mockResolvedValue(true);
      (hashPassword as jest.Mock).mockResolvedValue('hashedNewPassword');
      const querySpy = jest
        .spyOn(databaseService, 'query')
        .mockResolvedValue(true);

      const result = await authService.changePassword(
        userId,
        currentPassword,
        newPassword,
      );

      expect(querySpy).toHaveBeenCalledWith(
        expect.stringContaining(
          'UPDATE person SET password = $1 WHERE person_id = $2',
        ),
        expect.arrayContaining(['hashedNewPassword', userId]),
      );
      expect(result.status).toBe(HttpStatus.OK);
      expect(result.message).toBe('Password has been changed successfully.');
    });

    it('should throw HttpException if user does not exist', async () => {
      jest.spyOn(authService, 'getUserById').mockResolvedValue(null);

      await expect(
        authService.changePassword(userId, currentPassword, newPassword),
      ).rejects.toThrow(HttpException);
    });

    it('should throw InvalidCredentials if the current password does not match', async () => {
      jest.spyOn(authService, 'getUserById').mockResolvedValue({ id: userId });
      jest
        .spyOn(authService, 'getUserPasswordById')
        .mockResolvedValue(currentPassword);
      (comparePasswords as jest.Mock).mockResolvedValue(false);

      await expect(
        authService.changePassword(userId, currentPassword, newPassword),
      ).rejects.toThrow(InvalidCredentials);
    });

    it('should handle database errors during password update', async () => {
      jest.spyOn(authService, 'getUserById').mockResolvedValue({ id: userId });
      jest
        .spyOn(authService, 'getUserPasswordById')
        .mockResolvedValue(currentPassword);
      (comparePasswords as jest.Mock).mockResolvedValue(true);
      (hashPassword as jest.Mock).mockResolvedValue('hashedNewPassword');
      jest.spyOn(databaseService, 'query').mockResolvedValue(null);

      await expect(
        authService.changePassword(userId, currentPassword, newPassword),
      ).rejects.toThrow(HttpException);
    });
  });
});
