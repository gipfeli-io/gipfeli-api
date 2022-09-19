import { BadRequestException } from '@nestjs/common';

/**
 * Multer filter object that only allows gpx file type.
 * @param _req
 * @param file
 * @param callback
 */
const gpxFileFilter = (_req, file, callback) => {
  return file.mimetype.match(/application\/(octet-stream|gpx\+xml)$/)
    ? callback(null, true)
    : callback(
        new BadRequestException(
          `Only gpx files are allowed. The mime type of your file was: ${file.mimetype}`,
        ),
        false,
      );
};

export default gpxFileFilter;
