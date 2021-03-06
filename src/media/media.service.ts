import { Inject, Injectable } from '@nestjs/common';
import {
  StorageProvider,
  StorageProviderInterface,
} from './providers/types/storage-provider';
import { UploadFileDto } from './dto/file';
import { AuthenticatedUserDto } from '../user/dto/user';
import { FilePath } from './enums/file-path';
import { InjectRepository } from '@nestjs/typeorm';
import { LessThan, Repository } from 'typeorm';
import { Image } from './entities/image.entity';
import { SavedImageDto } from './dto/image';
import {
  GeoReferenceProvider,
  GeoReferenceProviderInterface,
} from './providers/types/geo-reference-provider';
import { CleanUpResultDto } from './dto/clean-up-result';
import * as dayjs from 'dayjs';

@Injectable()
export class MediaService {
  constructor(
    @Inject(StorageProviderInterface)
    private readonly storageProvider: StorageProvider,
    @Inject(GeoReferenceProviderInterface)
    private readonly geoReferenceProvider: GeoReferenceProvider,
    @InjectRepository(Image)
    private readonly imageRepository: Repository<Image>,
  ) {}

  public async uploadImage(
    user: AuthenticatedUserDto,
    file: UploadFileDto,
  ): Promise<SavedImageDto> {
    const userId = user.id;
    const filePath = this.getStoragePath(FilePath.IMAGE, userId);
    const storedFile = await this.storageProvider.put(filePath, file);
    const location = await this.geoReferenceProvider.extractGeoLocation(file);

    const imageEntity = this.imageRepository.create({
      identifier: storedFile.identifier,
      location,
      userId,
    });
    const { id, identifier } = await this.imageRepository.save(imageEntity);

    return { id, identifier, location };
  }

  public async cleanUpImages(): Promise<CleanUpResultDto> {
    /*
     We only delete images which are older than 1 day and match the conditions
     to avoid accidentally deleting images that are in the upload process.
     This does only apply for the tour conditions; images without user are
     immediately deleted.
    */
    const bufferDate = dayjs().subtract(1, 'day').toDate();
    const dateCondition = LessThan(bufferDate);
    const imagesToClean = await this.imageRepository.find({
      where: [{ tourId: null, createdAt: dateCondition }, { userId: null }],
    });
    const imageIdentifiers = imagesToClean.map((image) => image.identifier);

    if (imagesToClean.length > 0) {
      const deletedFromStorage = await this.storageProvider.deleteMany(
        imageIdentifiers,
      );
      const deletedFromDb = await this.imageRepository.delete(
        imagesToClean.map((image) => image.id),
      );

      return new CleanUpResultDto(deletedFromDb, deletedFromStorage);
    }

    return new CleanUpResultDto();
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
