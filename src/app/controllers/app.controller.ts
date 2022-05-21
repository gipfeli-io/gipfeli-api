import { Controller, Get, Post, Request, Res, UseGuards } from '@nestjs/common';
import { AppService } from '../../core/services/app.service';
import { AuthService } from '../../core/services/auth.service';
import { LocalAuthGuard } from '../auth/guards/local-auth.guard';
import { Response } from 'express';

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
