import { Test, TestingModule } from '@nestjs/testing';
import exifr, { gps } from 'exifr';
import { ExifrProvider } from './exifr-provider';
import { UploadFileDto } from '../../dto/file';
import { Readable } from 'stream';
import { Point } from 'geojson';

/**
 * Note: we need to mock exifr's default export.
 * See: https://github.com/kulshekhar/ts-jest/issues/120
 */
jest.mock('exifr', () => {
  return {
    default: {
      gps: jest.fn(),
    },
  };
});

// Mock only required property on file
const mockFile: UploadFileDto = {
  buffer: new Readable(),
} as unknown as UploadFileDto;

describe('ExifrProvider', () => {
  let exifrProvider: ExifrProvider;
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ExifrProvider],
    }).compile();

    exifrProvider = module.get<ExifrProvider>(ExifrProvider);
  });

  it('returns a point object if coordinates could be extracted', async function () {
    const mockPoint = {
      latitude: 47.37789,
      longitude: 8.53174,
    };
    jest.spyOn(exifr, 'gps').mockImplementation(async () => mockPoint);

    const result = await exifrProvider.extractGeoLocation(mockFile);

    const expectedResult: Point = {
      type: 'Point',
      coordinates: [mockPoint.latitude, mockPoint.longitude],
    };
    expect(result).toEqual(expectedResult);
  });

  it('returns null if no coordinates can be extracted', async function () {
    jest.spyOn(exifr, 'gps').mockImplementation(async () => null);

    const result = await exifrProvider.extractGeoLocation(mockFile);

    expect(result).toEqual(null);
  });
});
