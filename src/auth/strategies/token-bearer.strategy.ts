import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-http-bearer';
import { ConfigService } from '@nestjs/config';

/**
 * This strategy just returns whether the supplied BearerToken matches the
 * defined clean up token in the configuration. It is only used for endpoints
 * without sensitive data, such as the cleanup task invocation for the our
 * storage.
 */
@Injectable()
export class TokenBearerStrategy extends PassportStrategy(
  Strategy,
  'tokenBearer',
) {
  private readonly cleanUpToken;

  constructor(private readonly configService: ConfigService) {
    super();
    this.cleanUpToken = configService.get<string>('media.cleanUpToken');
  }

  async validate(token: string): Promise<boolean> {
    return token === this.cleanUpToken;
  }
}
