import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { Injectable, NotFoundException } from '@nestjs/common';
import { AuthService } from '../auth.service';
import { UserIdentifier } from '../dto/auth';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super({ usernameField: 'email' });
  }

  async validate(email: string, password: string): Promise<UserIdentifier> {
    const user = await this.authService.validateUser(email, password);
    if (!user) {
      throw new NotFoundException();
    }

    return user;
  }
}
