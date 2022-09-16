import { Readable } from 'stream';
import { ApiProperty } from '@nestjs/swagger';

/**
 * Defines how a file upload is sent in the body to our API. Note that due to
 * using @UploadedFile decorator on this body, the actual DTO that we're using
 * in our further code is the UploadFileDto, which unwraps the 'file' property
 * here into a full multer file.
 *
 * See https://docs.nestjs.com/openapi/operations#file-upload
 */
export class SingleFileUploadDto {
  @ApiProperty({ type: 'string', format: 'binary' })
  file: any;
}

/**
 * Wraps the Multer File so we do not have to pass down 3rd party dependencies
 * in our app. Only used internally.
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
