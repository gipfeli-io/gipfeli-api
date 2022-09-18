import { BadRequestException } from '@nestjs/common';

/**
 * Multer filter object that only allows certain image types.
 * @param _req
 * @param file
 * @param callback
 */
const imageFilter = (_req, file, callback) => {
  return file.mimetype.match(/image\/(jpg|jpeg|png|gif)$/)
    ? callback(null, true)
    : callback(
        new BadRequestException(
          `Only image files are allowed. Mime type was: ${file.mimetype}`,
        ),
        false,
      );
};

export default imageFilter;
