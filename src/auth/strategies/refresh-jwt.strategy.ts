import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { jwtConstants } from '../common/constants';
import { UserDto } from '../../user/dto/user';
import { RefreshToken } from '../dto/auth';

@Injectable()
export class RefreshJwtStrategy extends PassportStrategy(Strategy, 'refresh') {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: jwtConstants.secret,
    });
  }

  async validate(payload: RefreshToken): Promise<UserDto> {
    console.log(payload);
    return { id: 'payload.sub', email: 'payload.email' } as UserDto;
  }
}
