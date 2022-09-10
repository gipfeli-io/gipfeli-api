import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { ConfigService } from '@nestjs/config';
import { RandomTokenContainer } from './types/random-token';

@Injectable()
export class CryptoService {
  private readonly hashRounds: number;
  constructor(private readonly configService: ConfigService) {
    this.hashRounds = this.configService.get<number>('security.noOfHashRounds');
  }

  /**
   * Hashes the value with an automatically generated salt and returns the
   * hash value.
   *
   * @param value
   */
  async hash(value: string): Promise<string> {
    return bcrypt.hash(value, this.hashRounds);
  }

  /**
   * Checks whether a plaintext value matches a given hash.
   *
   * @param value The plaintext value
   * @param hash The hash to compare against
   */
  async compare(value: string, hash: string): Promise<boolean> {
    return bcrypt.compare(value, hash);
  }

  /**
   * Creates a random secure string that can be used as a token. Returns its
   * string representation as well as a hashed version.
   */
  async getRandomTokenWithHash(): Promise<RandomTokenContainer> {
    const token = crypto.randomBytes(25).toString('hex');
    const tokenHash = await this.hash(token);

    return { token, tokenHash };
  }
}
