import { Inject, Injectable } from '@nestjs/common';
import {
  StorageProvider,
  StorageProviderInterface,
} from './providers/types/storage-provider';
import { UploadFileDto } from './dto/file';

@Injectable()
export class MediaService {
  constructor(
    @Inject(StorageProviderInterface)
    private readonly storageProvider: StorageProvider,
  ) {}

  async uploadImage(file: UploadFileDto) {
    // Todo: Create path with user prepended.
    await this.storageProvider.put('images', file);
    // todo: create fileimage
  }
}
