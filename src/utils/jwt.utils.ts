import { Request } from 'express';
import * as jwt from 'jsonwebtoken';
import { InvalidJWTToken } from 'src/common/errors';
import { DecodedTokenDTO } from 'src/dto/auth.dto';

export class Jwt {
  constructor(
    private readonly secret: string,
    private readonly options?: jwt.SignOptions,
  ) {}

  public async sign(payload): Promise<string> {
    return jwt.sign(
      payload as unknown as DecodedTokenDTO,
      this.secret,
      this.options,
    );
  }

  public async decodeToken(token: string): Promise<DecodedTokenDTO> {
    return jwt.decode(token) as unknown as DecodedTokenDTO;
  }

  public async validateToken(token: string): Promise<DecodedTokenDTO> {
    if (!token) {
      throw new InvalidJWTToken();
    }
    try {
      await jwt.verify(token, this.secret);
      return await this.decodeToken(token);
    } catch (error) {
      if (error instanceof jwt.JsonWebTokenError) {
        throw new InvalidJWTToken('Token Already Expired');
      }
      throw new InvalidJWTToken(error.stack);
    }
  }

  public extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
