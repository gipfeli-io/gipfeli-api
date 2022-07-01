import { HttpException, HttpStatus } from '@nestjs/common';

export class UploadFailedException extends HttpException {
  constructor() {
    super('File Could not be uploaded.', HttpStatus.BAD_REQUEST);
  }
}
