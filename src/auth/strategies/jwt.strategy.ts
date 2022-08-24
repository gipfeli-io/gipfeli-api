import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AuthenticatedUserDto } from '../../user/dto/user.dto';
import { LoginRequest } from '../types/auth';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('security.jwtSecret'),
    });
  }

  async validate(
    payload: LoginRequest,
  ): Promise<boolean | AuthenticatedUserDto> {
    const { sub, email, role } = payload;

    if (!sub || !email || role === undefined) {
      return false;
    }

    return { id: sub, email, role };
  }
}
