import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { MediaService } from './media.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { classToClassFromExist, instanceToInstance } from 'class-transformer';
import { UploadFileDto } from './dto/file';

@Controller('media')
export class MediaController {
  constructor(private readonly mediaService: MediaService) {}

  @Post('upload-image')
  @UseInterceptors(FileInterceptor('image', { storage: memoryStorage() }))
  async uploadImage(@UploadedFile() file: UploadFileDto): Promise<void> {
    await this.mediaService.uploadImage(file);
  }
}
