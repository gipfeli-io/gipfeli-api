import { BadRequestException } from '@nestjs/common';

/**
 * Multer filter object that only allows gpx file type.
 * @param _req
 * @param file
 * @param callback
 */
const gpxFileFilter = (_req, file, callback) => {
  return file.mimetype.match(/application\/octet-stream$/)
    ? callback(null, true)
    : callback(new BadRequestException('Only gpx files are allowed'), false);
};

export default gpxFileFilter;
