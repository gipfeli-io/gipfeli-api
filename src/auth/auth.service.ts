import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';
import { CryptoService } from '../utils/crypto.service';
import { LoginDto } from './dto/auth';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly hashService: CryptoService,
  ) {}

  // Todo: typehint this? but how?
  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.userService.findOne(email);

    if (user && (await this.hashService.compare(password, user.password))) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async login(user: any): Promise<LoginDto> {
    const payload = { email: user.email, sub: user.id };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}
