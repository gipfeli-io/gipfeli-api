import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';
import { CryptoService } from '../utils/crypto.service';
import { TokenDto } from './dto/auth.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserSession } from './entities/user-session.entity';
import * as dayjs from 'dayjs';
import { RefreshedToken, UserIdentifier } from './types/auth';
import { ConfigService } from '@nestjs/config';
import { UserRole } from '../user/entities/user.entity';

@Injectable()
export class AuthService {
  private readonly authTokenValidity: number;
  private readonly refreshTokenValidity: number;

  constructor(
    private readonly configService: ConfigService,
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly hashService: CryptoService,
    @InjectRepository(UserSession)
    private readonly sessionRepository: Repository<UserSession>,
  ) {
    this.authTokenValidity = this.configService.get<number>(
      'security.authTokenValidity',
    );
    this.refreshTokenValidity = this.configService.get<number>(
      'security.refreshTokenValidity',
    );
  }

  async validateUser(
    email: string,
    password: string,
  ): Promise<UserIdentifier | null> {
    const user = await this.userService.findOneForAuth(email);
    const passwordsMatch = await this.hashService.compare(
      password,
      user.password,
    );

    return passwordsMatch
      ? { sub: user.id, email: user.email, role: user.role }
      : null;
  }

  /**
   * Creates a response that contains the signed access and refresh tokens.
   * @param sub
   * @param email
   * @param sessionId
   * @param role
   */
  async createTokenResponse(
    sub: string,
    email: string,
    sessionId: string,
    role: UserRole,
  ): Promise<TokenDto> {
    const payload = { email, sub, role };
    const accessToken = this.jwtService.sign(payload, {
      expiresIn: `${this.authTokenValidity}m`,
    });
    const refreshToken = this.jwtService.sign(
      { sessionId },
      { expiresIn: `${this.refreshTokenValidity}m` },
    );
    return {
      accessToken,
      refreshToken,
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
      role: session.user.role,
    };
  }

  async deleteSession(sessionId: string) {
    // Since we do not care if invalid session ids are sent, we just fire and
    // forget the delete request.
    await this.sessionRepository.delete(sessionId);
  }

  /**
   * Checks a token's validity by comparing its validity date by using the
   * REFRESH_TOKEN_VALIDITY environment variable.
   * @param validFrom
   * @private
   */
  private isTokenStillValid(validFrom: string) {
    const current = dayjs();
    const sessionValidUntil = dayjs(validFrom).add(
      this.refreshTokenValidity,
      'minutes',
    );

    return sessionValidUntil.isAfter(current);
  }
}
