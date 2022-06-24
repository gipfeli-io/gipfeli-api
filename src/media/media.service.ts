import { Inject, Injectable } from '@nestjs/common';
import {
  StorageProvider,
  StorageProviderInterface,
} from './providers/types/storage-provider';
import { UploadFileDto } from './dto/file';
import { UserDto } from '../user/dto/user';
import { FilePath } from './enums/file-path';

@Injectable()
export class MediaService {
  constructor(
    @Inject(StorageProviderInterface)
    private readonly storageProvider: StorageProvider,
  ) {}

  async uploadImage(user: UserDto, file: UploadFileDto) {
    const { id } = user;
    const filePath = this.getStoragePath(FilePath.IMAGE, id);
    await this.storageProvider.put(filePath, file);
    // todo: create fileimage
  }

  /**
   * Creates the storage path for a given file by prepending the user id with
   * the filetype's media prefix.
   * @param basePath
   * @param userId
   * @private
   */
  private getStoragePath(basePath: FilePath, userId: string): string {
    return `${basePath}/${userId}`;
  }
}
