import { CryptoService } from './crypto.service';
import * as bcrypt from 'bcrypt';

describe('CryptoService', () => {
  let service: CryptoService;
  const env = process.env;
  const noOfRounds = 10;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...env };
    process.env.NO_OF_ROUNDS = String(noOfRounds);

    service = new CryptoService();
  });

  describe('hash', () => {
    it('returns a value hash', async () => {
      const value = 'check-for-hash';

      const result = await service.hash(value);

      expect(result.startsWith(`$2b$${noOfRounds}$`)).toEqual(true);
      expect(result.length).toEqual(60);
    });

    it('takes the env variable for number of rounds', async () => {
      const value = 'check-for-hash';

      const result = await service.hash(value);

      expect(bcrypt.getRounds(result)).toEqual(noOfRounds);
    });
  });

  describe('compare', () => {
    it('returns true if value matches a hash', async () => {
      const value = 'check-for-hash';
      const hash = bcrypt.hashSync(value, 1);

      const result = await service.compare(value, hash);

      expect(result).toEqual(true);
    });

    it('returns false if value does not match a hash', async () => {
      const value = 'check-for-hash';
      const alteredValue = 'Check-for-hash';
      const hash = bcrypt.hashSync(alteredValue, 1);

      const result = await service.compare(value, hash);

      expect(result).toEqual(false);
    });

    afterEach(() => {
      process.env = env;
    });
  });
});
