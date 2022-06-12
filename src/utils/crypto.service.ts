import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';

@Injectable()
export class CryptoService {
  private readonly hashRounds: number = parseInt(process.env.NO_OF_ROUNDS);

  /**
   * Hashes the value with an automatically generated salt and returns the
   * hash value.
   *
   * @param value
   */
  async hash(value: string): Promise<string> {
    return await bcrypt.hash(value, this.hashRounds);
  }

  /**
   * Checks whether a plaintext value matches a given hash.
   *
   * @param value The plaintext value
   * @param hash The hash to compare against
   */
  async compare(value: string, hash: string): Promise<boolean> {
    return await bcrypt.compare(value, hash);
  }

  /**
   * Creates a random secure string that can be used as a token. Returns its
   * string representation as well as a hashed version.
   */
  async getRandomTokenWithHash(): Promise<{
    token: string;
    tokenHash: string;
  }> {
    const token = crypto.randomBytes(25).toString('hex');
    const tokenHash = await this.hash(token);

    return { token, tokenHash };
  }
}
