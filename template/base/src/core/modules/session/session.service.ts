import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class SessionService {
  constructor(private jwt: JwtService, private config: ConfigService) {}

  async verifyToken(token: string) {
    try {
      const data = await this.jwt.verifyAsync(token, {
        secret: this.config.get('jwt').secret,
      });
      return { data };
    } catch (error) {
      return { error };
    }
  }
}
