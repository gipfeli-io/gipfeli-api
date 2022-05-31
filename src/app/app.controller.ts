import {
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Post,
  Request,
  Res,
  UseGuards,
} from '@nestjs/common';
import { AppService } from './app.service';
import { AuthService } from '../auth/auth.service';
import { Response } from 'express';
import { LocalAuthGuard } from '../auth/guards/local-auth.guard';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly authService: AuthService,
  ) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('test-sentry')
  testSentry(): void {
    throw Error('Something went very wrong!');
  }

  @Get('test-forbidden')
  testForbidden(): void {
    throw new HttpException('Forbidden', HttpStatus.FORBIDDEN);
  }

  @Get('test-unauthorized')
  testUnauthorized(): void {
    throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
  }

  @Get('test-not-found')
  testNotFound(): void {
    throw new HttpException('Not found', HttpStatus.NOT_FOUND);
  }

  @Get('robots.txt')
  getRobotsTxt(@Res() res: Response): void {
    res.type('text/plain');
    res.send('User-agent: *\nDisallow: /');
  }

  @UseGuards(LocalAuthGuard)
  @Post('auth/login')
  async login(@Request() req) {
    return this.authService.login(req.user);
  }
}
