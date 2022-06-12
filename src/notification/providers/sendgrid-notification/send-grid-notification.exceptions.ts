import { HttpException, HttpStatus } from '@nestjs/common';

export class EmailNotSent extends HttpException {
  constructor() {
    super('Email could not be sent.', HttpStatus.BAD_REQUEST);
  }
}
