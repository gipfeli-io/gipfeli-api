import { Controller, Get, Inject, Res } from '@nestjs/common';
import { Response } from 'express';
import {
  NotificationService,
  NotificationServiceInterface,
} from '../notification/types/notification-service';

@Controller()
export class AppController {
  constructor(
    @Inject(NotificationServiceInterface)
    private notificationService: NotificationService,
  ) {}

  @Get('robots.txt')
  getRobotsTxt(@Res() res: Response): void {
    res.type('text/plain');
    res.send('User-agent: *\nDisallow: /');
  }

  @Get('debug-msg')
  async debugMsg(): Promise<void> {
    const recipient = { name: 'Mister Debug', email: 'debug@gipfeli.io' };
    const message = 'This is a test message.';
    await this.notificationService.sendDebugMessage(message, recipient);
  }
}
