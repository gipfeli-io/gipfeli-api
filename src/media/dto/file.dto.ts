import { Readable } from 'stream';
import { ApiProperty } from '@nestjs/swagger';

/**
 * This DTO is only used for properly typing our API. We cannot use the actual
 * UploadFileDto there, as this already unwraps our uploaded file.
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
