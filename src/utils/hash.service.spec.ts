import { HashService } from './/hash.service';
import * as bcrypt from 'bcrypt';

describe('Hashservice', () => {
  let service: HashService;
  const env = process.env;
  const noOfRounds = 10;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...env };
    process.env.NO_OF_ROUNDS = String(noOfRounds);

    service = new HashService();
  });

  describe('hash', () => {
    it('returns a password hash', async () => {
      const password = 'check-for-hash';

      const result = await service.hash(password);

      expect(result.startsWith(`$2b$${noOfRounds}$`)).toEqual(true);
      expect(result.length).toEqual(60);
    });

    it('takes the env variable for number of rounds', async () => {
      const password = 'check-for-hash';

      const result = await service.hash(password);

      expect(bcrypt.getRounds(result)).toEqual(noOfRounds);
    });
  });

  describe('compare', () => {
    it('returns true if password matches a hash', async () => {
      const password = 'check-for-hash';
      const hash = bcrypt.hashSync(password, 1);

      const result = await service.compare(password, hash);

      expect(result).toEqual(true);
    });

    it('returns false if password does not match a hash', async () => {
      const password = 'check-for-hash';
      const alteredPassword = 'Check-for-hash';
      const hash = bcrypt.hashSync(alteredPassword, 1);

      const result = await service.compare(password, hash);

      expect(result).toEqual(false);
    });

    afterEach(() => {
      process.env = env;
    });
  });
});
