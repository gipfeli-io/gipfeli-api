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

@Controller('media')
export class MediaController {
  constructor(
    private readonly mediaService: MediaService,
    @Inject(NotificationServiceInterface)
    private notificationService: NotificationService,
  ) {}

  @Post('upload-image')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('image', { fileFilter: imageFilter }))
  async uploadImage(
    @User() user: AuthenticatedUserDto,
    @UploadedFile() file: UploadFileDto,
  ): Promise<SavedImageDto> {
    return this.mediaService.uploadImage(user, file);
  }

  @Get('clean-up-images')
  @UseGuards(TokenBearerAuthGuard)
  async cleanUpImages(): Promise<{ status: boolean }> {
    const result = await this.mediaService.cleanUpImages();

    await this.notificationService.sendCleanUpResults(result);

    return { status: true };
  }
}
