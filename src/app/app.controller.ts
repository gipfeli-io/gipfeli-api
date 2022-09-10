import { Controller, Get, Inject, Res } from '@nestjs/common';
import { Response } from 'express';
import {
  NotificationService,
  NotificationServiceInterface,
} from '../notification/types/notification-service';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('base')
@Controller()
export class AppController {
  constructor(
    @Inject(NotificationServiceInterface)
    private notificationService: NotificationService,
  ) {}

  /**
   * Renders a robots.txt file that disallows all crawlers.
   */
  @Get('robots.txt')
  getRobotsTxt(@Res() res: Response): void {
    res.type('text/plain');
    res.send('User-agent: *\nDisallow: /');
  }

  /**
   * Sends a debug message to debug@gipfeli.io. Depending on the environment, a
   * different notification provider is used.
   */
  @Get('debug-msg')
  async debugMsg(): Promise<void> {
    const recipient = { name: 'Mister Debug', email: 'debug@gipfeli.io' };
    const message = 'This is a test message.';
    await this.notificationService.sendDebugMessage(message, recipient);
  }

  /**
   * Returns a message which can be used to check whether the API is reachable.
   */
  @Get('heartbeat')
  async heartbeat(): Promise<string> {
    return 'Up and running';
  }
}
