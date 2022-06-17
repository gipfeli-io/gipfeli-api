import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';
import { CryptoService } from '../utils/crypto.service';
import { TokenDto } from './dto/auth';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserSession } from './entities/user-session.entity';
import * as dayjs from 'dayjs';
import { RefreshedToken, UserIdentifier } from './types/auth';

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

  /**
   * Creates a response that contains the signed access and refresh tokens.
   * @param sub
   * @param email
   * @param sessionId
   */
  async createTokenResponse(
    sub: string,
    email: string,
    sessionId: string,
  ): Promise<TokenDto> {
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

  /**
   * For a given sessionId, checks whether such a session exists. If it does, it
   * checks for its validity and, if it is still valid, updates the session
   * object and returns the payload needed for creating a new AuthToken and
   * RefreshToken.
   * @param sessionId
   */
  async handleTokenRefresh(sessionId: string): Promise<RefreshedToken> {
    const session = await this.sessionRepository.findOne(sessionId, {
      relations: ['user'],
    });

    if (!session) {
      return;
    }

    if (!this.isTokenStillValid(session.validFrom)) {
      await this.sessionRepository.delete(session);
      return;
    }

    session.validFrom = dayjs().toISOString();
    await this.sessionRepository.save(session);

    return {
      sub: session.user.id,
      email: session.user.email,
      sessionId: session.id,
    };
  }

  /**
   * Checks a token's validity by comparing its validity date by using the
   * REFRESH_TOKEN_VALIDITY environment variable.
   * @param validFrom
   * @private
   */
  private isTokenStillValid(validFrom: string) {
    const validity = process.env.REFRESH_TOKEN_VALIDITY;
    const current = dayjs();
    const sessionValidUntil = dayjs(validFrom).add(
      parseInt(validity),
      'minutes',
    );

    return sessionValidUntil.isAfter(current);
  }
}
