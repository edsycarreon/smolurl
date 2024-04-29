import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ApiResponse } from 'src/common/api-response';
import { castSignInDTO } from 'src/common/casts/auth.cast';
import { AccountAlreadyExists, InvalidCredentials } from 'src/common/errors';
import { DatabaseService } from 'src/database/database.service';
import { RegisterAccountDTO, SignInAccountDTO } from 'src/dto';
import { castToArray, comparePasswords, hashPassword } from 'src/utils';

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
    Logger.log('Signing in');
    const { email, password } = body;

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

  async getUserByEmail(email: string) {
    const values = [email];
    const query = `SELECT * FROM person WHERE email = $1`;

    const response = await this.databaseService.query(query, values);
    const user: SignInAccountDTO[] = castToArray(response.rows).map(
      castSignInDTO,
    );

    return user[0];
  }
}
