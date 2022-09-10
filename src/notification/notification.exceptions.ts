import { HttpException, HttpStatus } from '@nestjs/common';

export class EmailNotSentException extends HttpException {
  constructor() {
    super('Email could not be sent.', HttpStatus.BAD_REQUEST);
  }
}
