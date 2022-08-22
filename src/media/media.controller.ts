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
import { UploadFileDto } from './dto/file.dto';
import imageFilter from './filters/image.filter';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { User } from '../utils/decorators/user.decorator';
import { AuthenticatedUserDto } from '../user/dto/user.dto';
import { SavedImageDto } from './dto/image.dto';
import { TokenBearerAuthGuard } from '../auth/guards/token-bearer-auth.guard';
import {
  NotificationService,
  NotificationServiceInterface,
} from '../notification/types/notification-service';
import { SavedGpxFileDto } from './dto/gpx-file.dto';
import gpxFileFilter from './filters/gpx-file.filter';
import { SkipThrottle } from '@nestjs/throttler';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiPayloadTooLargeResponse,
  ApiTags,
} from '@nestjs/swagger';
import { GenericStatusResponseWithContent } from '../utils/types/response';
import { ContentObject } from '@nestjs/swagger/dist/interfaces/open-api-spec.interface';

@ApiBearerAuth()
@ApiTags('media')
@Controller('media')
export class MediaController {
  constructor(
    private readonly mediaService: MediaService,
    @Inject(NotificationServiceInterface)
    private notificationService: NotificationService,
  ) {}

  /**
   * Uploads an image file for a given user to the storage and returns its
   * handle with its database identifier.
   * @param user
   * @param file
   */
  @SkipThrottle() // Because a lot of images may be uploaded at once
  @ApiPayloadTooLargeResponse({
    description: 'Thrown if the file exceeds the configured filesize limit.',
  })
  @Post('upload-image')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('image', { fileFilter: imageFilter }))
  async uploadImage(
    @User() user: AuthenticatedUserDto,
    @UploadedFile() file: UploadFileDto,
  ): Promise<SavedImageDto> {
    return this.mediaService.uploadImage(user, file);
  }

  /**
   * Uploads a gpx file for a given user to the storage and returns its handle
   * with its database identifier.
   * @param user
   * @param file
   */
  @ApiPayloadTooLargeResponse({
    description: 'Thrown if the file exceeds the configured filesize limit.',
  })
  @Post('upload-gpx-file')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('gpxFile', { fileFilter: gpxFileFilter }))
  async uploadGpxFile(
    @User() user: AuthenticatedUserDto,
    @UploadedFile() file: UploadFileDto,
  ): Promise<SavedGpxFileDto> {
    return this.mediaService.uploadGpxFile(user, file);
  }

  /**
   * Starts a media clean up process which removes orphaned media files from the
   * database and the storage. Takes a secret key as Bearer token.
   */
  @Get('clean-up-media')
  @UseGuards(TokenBearerAuthGuard)
  async cleanUpMedia(): Promise<void> {
    const result = await this.mediaService.cleanUpMedia();
    await this.notificationService.sendCleanUpResults(result);
  }
}
