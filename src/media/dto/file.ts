import { Readable } from 'stream';

/**
 * Wraps the Multer File so we do not have to pass down 3rd party dependencies
 * in our app.
 */
export class UploadFileDto implements Express.Multer.File {
  buffer: Buffer;
  destination: string;
  encoding: string;
  fieldname: string;
  filename: string;
  mimetype: string;
  originalname: string;
  path: string;
  size: number;
  stream: Readable;
}
