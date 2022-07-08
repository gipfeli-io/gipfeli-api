import { Injectable } from '@nestjs/common';
import { UploadFileDto } from '../../dto/file';
import { GeoReferenceProvider } from '../types/geo-reference-provider';
import { Point } from 'geojson';
import exifr from 'exifr';

@Injectable()
export class ExifrProvider implements GeoReferenceProvider {
  async extractGeoLocation(file: UploadFileDto): Promise<Point | null> {
    const { buffer } = file;
    const coordinates = await exifr.gps(buffer);

    if (coordinates) {
      return this.getPoint(coordinates.latitude, coordinates.longitude);
    }

    return null;
  }

  private getPoint(latitude: number, longitude: number): Point {
    return { type: 'Point', coordinates: [longitude, latitude] };
  }
}
