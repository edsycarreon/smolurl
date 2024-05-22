import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ApiResponse } from '../../common/api-response';
import { castCustomerDto } from '../../common/casts';
import { AccountAlreadyExists, InvalidCredentials } from '../../common/errors';
import { DatabaseService } from '../../database/database.service';
import { CustomerDTO, RegisterAccountDTO, SignInAccountDTO } from '../../dto';
import { castToArray, comparePasswords, hashPassword } from '../../utils';

@Injectable()
export class AuthService {
  constructor(
    private readonly databaseService: DatabaseService,
    private readonly jwtService: JwtService,
  ) {}

  public async signUp(body: RegisterAccountDTO) {
    Logger.log('Signing up');
    const { firstName, lastName, email, password } = body;

    const user = await this.getUserByEmail(email);
    if (user) {
      throw new AccountAlreadyExists();
    }

    const hashedPassword = await hashPassword(password);
    const query = `
      INSERT INTO person (first_name, last_name, email, password) 
      VALUES ($1, $2, $3, $4)`;
    const values = [firstName, lastName, email, hashedPassword];

    const response = await this.databaseService.query(query, values);

    if (!response) {
      throw new HttpException(
        new ApiResponse<any>(
          HttpStatus.INTERNAL_SERVER_ERROR,
          'Error creating account',
        ),
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    return new ApiResponse<any>(
      HttpStatus.CREATED,
      'Account created successfully',
    );
  }

  public async signIn(body: SignInAccountDTO) {
    const { email, password } = body;
    Logger.log(`Signing in: ${email}`);

    const user = await this.getUserByEmail(email);
    if (!user) {
      throw new InvalidCredentials();
    }

    const hashedPassword = user.password;
    const isPasswordMatched = await comparePasswords(password, hashedPassword);
    if (!isPasswordMatched) {
      throw new InvalidCredentials();
    }
    const token = await this.jwtService.signAsync({
      user: user,
    });

    return new ApiResponse<string>(HttpStatus.OK, 'Login successful', token);
  }

  public async changePassword(
    id: number,
    currentPassword: string,
    newPassword: string,
  ) {
    Logger.log('Changing password');
    const userExists = await this.getUserById(id);
    if (!userExists) {
      throw new HttpException(
        new ApiResponse<any>(HttpStatus.NOT_FOUND, 'User not found.'),
        HttpStatus.NOT_FOUND,
      );
    }

    const userPassword = await this.getUserPasswordById(id);
    const isPasswordMatched = await comparePasswords(
      currentPassword,
      userPassword,
    );

    if (!isPasswordMatched) {
      throw new InvalidCredentials();
    }

    const hashedPassword = await hashPassword(newPassword);
    const query = `UPDATE person SET password = $1 WHERE person_id = $2`;
    const values = [hashedPassword, id];
    const response = await this.databaseService.query(query, values);

    if (!response) {
      throw new HttpException(
        new ApiResponse<any>(
          HttpStatus.INTERNAL_SERVER_ERROR,
          'Error changing account password',
        ),
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    return new ApiResponse<any>(
      HttpStatus.OK,
      'Password has been changed successfully.',
    );
  }

  async getUserByEmail(email: string) {
    const values = [email];
    const query = `SELECT * FROM person WHERE email = $1`;

    const response = await this.databaseService.query(query, values);
    const user: CustomerDTO[] = castToArray(response.rows).map(castCustomerDto);

    return user[0];
  }

  async getUserById(id: number) {
    const values = [id];
    const query = `SELECT * FROM person WHERE person_id = $1`;

    const response = await this.databaseService.query(query, values);
    const user: CustomerDTO[] = castToArray(response.rows).map(castCustomerDto);

    return user[0];
  }

  async getUserPasswordById(id: number) {
    const values = [id];
    const query = `SELECT password FROM person WHERE person_id = $1`;

    const response = await this.databaseService.query(query, values);
    const user: CustomerDTO[] = castToArray(response.rows).map(castCustomerDto);

    return user[0].password;
  }
}
