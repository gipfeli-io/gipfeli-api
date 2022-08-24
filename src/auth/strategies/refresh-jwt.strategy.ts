import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AuthService } from '../auth.service';
import { RefreshedToken, RefreshTokenRequest } from '../types/auth';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class RefreshJwtStrategy extends PassportStrategy(Strategy, 'refresh') {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('security.jwtSecret'),
    });
  }

  async validate(
    payload: RefreshTokenRequest,
  ): Promise<boolean | RefreshedToken> {
    const { sessionId } = payload;

    if (!sessionId) {
      return false;
    }

    return this.authService.handleTokenRefresh(payload.sessionId);
  }
}
