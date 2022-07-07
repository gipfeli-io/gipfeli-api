import { UploadFileDto } from '../../dto/file';
import { Point } from 'geojson';

/**
 * Since there are many exif reader libraries, but all are somehow abandoned, we
 * abstract this as a provider so we do not have these dependencies in our
 * service. If our current provider (exifr) does no longer work, we can just
 * swap it out with another provider.
 */
export interface GeoReferenceProvider {
  /**
   * Try to extract coordinates from exif information in a file - if there is
   * none or the filetype does not match, return null.
   * @param path
   * @param file
   */
  extractGeoLocation: (file: UploadFileDto) => Promise<Point | null>;
}

/**
 * Used by nestjs to inject the correct provider.
 */
export const GeoReferenceProviderInterface = Symbol(
  'GeoReferenceProviderInterface',
);
