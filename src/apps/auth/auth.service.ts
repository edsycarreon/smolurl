import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ApiResponse } from 'src/common/api-response';
import { castSignInDTO } from 'src/common/casts/auth.cast';
import { ErrorCode, ErrorMessage } from 'src/common/constants';
import { DatabaseService } from 'src/database/database.service';
import { RegisterAccountDTO, SignInAccountDTO } from 'src/dto';
import { castToArray, comparePasswords, hashPassword } from 'src/utils';

@Injectable()
export class AuthService {
  constructor(
    private readonly databaseService: DatabaseService,
    private readonly jwtService: JwtService,
  ) {}

  async signUp(body: RegisterAccountDTO) {
    const { firstName, lastName, email, password } = body;

    const hashedPassword = await hashPassword(password);

    const query = `
      INSERT INTO person (first_name, last_name, email, password) 
      VALUES ($1, $2, $3, $4)`;

    const values = [firstName, lastName, email, hashedPassword];

    try {
      const response = await this.databaseService.query(query, values);

      if (response) {
        return new ApiResponse<any>(
          HttpStatus.CREATED,
          'Account created successfully',
          null,
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

  async signIn(body: SignInAccountDTO) {
    const { email, password } = body;
    const values = [email];
    const query = `SELECT * FROM person WHERE email = $1`;

    try {
      const response = await this.databaseService.query(query, values);
      const res: SignInAccountDTO[] = castToArray(response.rows).map(
        castSignInDTO,
      );
      if (res.length > 0) {
        const hashedPassword = res[0].password;
        const isPasswordMatched = await comparePasswords(
          password,
          hashedPassword,
        );
        if (!isPasswordMatched) {
          return new ApiResponse<string>(
            HttpStatus.UNAUTHORIZED,
            ErrorCode.INCORRECT_PASSWORD,
            ErrorMessage.INCORRECT_PASSWORD,
          );
        }
        const token = await this.jwtService.signAsync({
          user: res[0],
        });

        return new ApiResponse<string>(
          HttpStatus.OK,
          'Login successful',
          token,
        );
      }
    } catch (e) {
      console.log(e);
      throw new HttpException(
        new ApiResponse<any>(
          HttpStatus.INTERNAL_SERVER_ERROR,
          'Error logging in',
          e,
        ),
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
