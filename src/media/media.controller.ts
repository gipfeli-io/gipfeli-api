import {
  Controller,
  Get,
  Inject,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { MediaService } from './media.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { UploadFileDto } from './dto/file';
import imageFilter from './filters/image.filter';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { User } from '../utils/decorators/user.decorator';
import { AuthenticatedUserDto } from '../user/dto/user';
import { SavedImageDto } from './dto/image';
import { TokenBearerAuthGuard } from '../auth/guards/token-bearer-auth.guard';
import {
  NotificationService,
  NotificationServiceInterface,
} from '../notification/types/notification-service';
import { SavedGpxDto } from './dto/gpx-file';
import gpxFileFilter from './filters/gpx-file.filter';
import { SkipThrottle } from '@nestjs/throttler';

@Controller('media')
export class MediaController {
  constructor(
    private readonly mediaService: MediaService,
    @Inject(NotificationServiceInterface)
    private notificationService: NotificationService,
  ) {}

  @SkipThrottle() // Because a lot of images may be uploaded at once
  @Post('upload-image')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('image', { fileFilter: imageFilter }))
  async uploadImage(
    @User() user: AuthenticatedUserDto,
    @UploadedFile() file: UploadFileDto,
  ): Promise<SavedImageDto> {
    return this.mediaService.uploadImage(user, file);
  }

  @Post('upload-gpx')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('gpxFile', { fileFilter: gpxFileFilter }))
  async uploadGpxFile(
    @User() user: AuthenticatedUserDto,
    @UploadedFile() file: UploadFileDto,
  ): Promise<SavedGpxDto> {
    return this.mediaService.uploadGpxFile(user, file);
  }

  @Get('clean-up-media')
  @UseGuards(TokenBearerAuthGuard)
  async cleanUpMedia(): Promise<void> {
    const result = await this.mediaService.cleanUpMedia();
    await this.notificationService.sendCleanUpResults(result);
  }
}
