import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';
import { CryptoService } from '../utils/crypto.service';
import { LoginDto, UserIdentifier } from './dto/auth';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserSession } from './entities/user-session.entity';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly hashService: CryptoService,
    @InjectRepository(UserSession)
    private readonly sessionRepository: Repository<UserSession>,
  ) {}

  async validateUser(
    email: string,
    password: string,
  ): Promise<UserIdentifier | null> {
    const user = await this.userService.findOne(email);

    if (user && (await this.hashService.compare(password, user.password))) {
      return { sub: user.id, email: user.email };
    }
    return null;
  }

  async login(
    sub: string,
    email: string,
    sessionId: string,
  ): Promise<LoginDto> {
    const payload = { email, sub };
    const access_token = this.jwtService.sign(payload);
    const refresh_token = this.jwtService.sign(
      { sessionId },
      { expiresIn: '30d' },
    );
    return {
      access_token,
      refresh_token,
    };
  }

  async createSession(userId: string): Promise<string> {
    const session = this.sessionRepository.create({ userId });
    const result = await this.sessionRepository.save(session);

    return result.id;
  }
}
