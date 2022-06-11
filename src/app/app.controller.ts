import { Controller, Get, Post, Request, Res, UseGuards } from '@nestjs/common';
import { Response } from 'express';

@Controller()
export class AppController {
  @Get('robots.txt')
  getRobotsTxt(@Res() res: Response): void {
    res.type('text/plain');
    res.send('User-agent: *\nDisallow: /');
  }
}
