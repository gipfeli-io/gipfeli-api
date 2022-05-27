import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

@Injectable()
export class HashService {
  private readonly hashRounds: number = parseInt(process.env.NO_OF_ROUNDS);

  /**
   * Hashes the password with an automatically generated salt and returns the
   * hash value.
   *
   * @param password
   */
  async hash(password: string): Promise<string> {
    return await bcrypt.hash(password, this.hashRounds);
  }

  /**
   * Checks whether a plaintext password matches a given hash.
   *
   * @param password The plaintext password
   * @param hash The hash to compare against
   */
  async compare(password: string, hash: string): Promise<boolean> {
    return await bcrypt.compare(password, hash);
  }
}
