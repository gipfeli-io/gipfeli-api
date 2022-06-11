import { HttpException, HttpStatus } from '@nestjs/common';

export class UserAlreadyExists extends HttpException {
  constructor() {
    super('User already exists.', HttpStatus.BAD_REQUEST);
  }
}

export class UserNotActivated extends HttpException {
  constructor() {
    super('User is not activated.', HttpStatus.BAD_REQUEST);
  }
}
