import { Controller, Get } from '@nestjs/common';
import { MediaService } from './media.service';

@Controller('media')
export class MediaController {
  constructor(private readonly mediaService: MediaService) {}

  @Get('debug')
  async debug(): Promise<void> {
    await this.mediaService.debug();
  }
}
