import { Inject, Injectable } from '@nestjs/common';
import {
  StorageProvider,
  StorageProviderInterface,
} from './providers/types/storage-provider';
import { UploadFileDto } from './dto/file';
import { AuthenticatedUserDto } from '../user/dto/user';
import { FilePath } from './enums/file-path';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Image } from './entities/image.entity';
import { SavedImageDto } from './dto/image';

@Injectable()
export class MediaService {
  constructor(
    @Inject(StorageProviderInterface)
    private readonly storageProvider: StorageProvider,
    @InjectRepository(Image)
    private readonly imageRepository: Repository<Image>,
  ) {}

  async uploadImage(
    user: AuthenticatedUserDto,
    file: UploadFileDto,
  ): Promise<SavedImageDto> {
    const userId = user.id;
    const filePath = this.getStoragePath(FilePath.IMAGE, userId);
    const storedFile = await this.storageProvider.put(filePath, file);

    const imageEntity = this.imageRepository.create({
      identifier: storedFile.identifier,
      userId,
    });
    const { id, identifier } = await this.imageRepository.save(imageEntity);

    return { id, identifier };
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
