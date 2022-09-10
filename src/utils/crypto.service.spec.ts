import { CryptoService } from './crypto.service';
import * as bcrypt from 'bcrypt';
import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';

describe('CryptoService', () => {
  let cryptoService: CryptoService;
  let configService: ConfigService;
  const noOfRounds = 10;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CryptoService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => {
              if (key === 'security.noOfHashRounds') {
                return noOfRounds;
              }
              return null;
            }),
          },
        },
      ],
    }).compile();

    cryptoService = module.get<CryptoService>(CryptoService);
    configService = module.get<ConfigService>(ConfigService);
  });

  describe('hash', () => {
    it('returns a value hash', async () => {
      const value = 'check-for-hash';

      const result = await cryptoService.hash(value);

      expect(result.startsWith(`$2b$${noOfRounds}$`)).toEqual(true);
      expect(result.length).toEqual(60);
    });

    it('takes the env variable from the configService for number of rounds', async () => {
      const value = 'check-for-hash';
      const configSpy = jest.spyOn(configService, 'get');

      const result = await cryptoService.hash(value);

      expect(configSpy).toHaveBeenCalledWith('security.noOfHashRounds');
      expect(bcrypt.getRounds(result)).toEqual(noOfRounds);
    });
  });

  describe('compare', () => {
    it('returns true if value matches a hash', async () => {
      const value = 'check-for-hash';
      const hash = bcrypt.hashSync(value, 1);

      const result = await cryptoService.compare(value, hash);

      expect(result).toEqual(true);
    });

    it('returns false if value does not match a hash', async () => {
      const value = 'check-for-hash';
      const alteredValue = 'Check-for-hash';
      const hash = bcrypt.hashSync(alteredValue, 1);

      const result = await cryptoService.compare(value, hash);

      expect(result).toEqual(false);
    });
  });
});
