import { Inject, Injectable } from '@nestjs/common';
import { StorageProvider, StorageProviderInterface, } from './providers/types/storage-provider';
import { UploadFileDto } from './dto/file.dto';
import { AuthenticatedUserDto } from '../user/dto/user.dto';
import { FilePath } from './enums/file-path';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, FindOperator, LessThan, Repository } from 'typeorm';
import { Image } from './entities/image.entity';
import { SavedImageDto } from './dto/image.dto';
import { GeoReferenceProvider, GeoReferenceProviderInterface, } from './providers/types/geo-reference-provider';
import { CleanUpResultDto } from './dto/clean-up-result.dto';
import * as dayjs from 'dayjs';
import { SavedGpxFileDto } from './dto/gpx-file.dto';
import { GpxFile } from './entities/gpx-file.entity';

@Injectable()
export class MediaService {
  constructor(
    @Inject(StorageProviderInterface)
    private readonly storageProvider: StorageProvider,
    @Inject(GeoReferenceProviderInterface)
    private readonly geoReferenceProvider: GeoReferenceProvider,
    @InjectRepository(Image)
    private readonly imageRepository: Repository<Image>,
    @InjectRepository(GpxFile)
    private readonly gpxFileRepository: Repository<GpxFile>,
  ) {
  }

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

  public async uploadGpxFile(
    user: AuthenticatedUserDto,
    file: UploadFileDto,
  ): Promise<SavedGpxFileDto> {
    const filePath = this.getStoragePath(FilePath.GPX_FILES, user.id);
    const storedFile = await this.storageProvider.put(filePath, file);
    const gpxFileEntity = this.gpxFileRepository.create({
      identifier: storedFile.identifier,
      name: file.originalname,
      user: { id: user.id },
    });
    const { id, identifier, name } = await this.gpxFileRepository.save(
      gpxFileEntity,
    );

    return { id, identifier, name };
  }

  public async cleanUpMedia(): Promise<CleanUpResultDto> {
    /*
     We only delete media which is older than 1 day and matches the conditions
     to avoid accidentally deleting media that is in the upload process.
     This does only apply for the tour conditions; media without a user is
     immediately deleted.
    */
    const bufferDate = dayjs().subtract(1, 'day').toDate();
    const dateCondition = LessThan(bufferDate);
    const imageCleanUpResultDto = await this.cleanUpImages(dateCondition);
    const gpxCleanUpResultDto = await this.cleanUpGpxFiles(dateCondition);

    return this.getOverallStatistics(
      imageCleanUpResultDto,
      gpxCleanUpResultDto,
    );
  }

  private getOverallStatistics(...results: CleanUpResultDto[]) {
    return {
      database: {
        affected: results
          .map((result) => result.database.affected)
          .reduce(this.sum, 0),
        raw: null,
      },
      storage: {
        errors: results.map((result) => result.storage.errors).flat(),
        successfulOperations: results
          .map((result) => result.storage.successfulOperations)
          .reduce(this.sum, 0),
        totalOperations: results
          .map((result) => result.storage.totalOperations)
          .reduce(this.sum, 0),
      },
    };
  }

  /**
   * Used for statistics reducer. If we need this in another place, this should
   * be extracted to a helper method.
   * @param a
   * @param b
   * @private
   */
  private sum(a: number, b: number): number {
    return a + b;
  }

  private async cleanUpImages(
    dateCondition: FindOperator<Date>,
  ): Promise<CleanUpResultDto> {
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

  private async cleanUpGpxFiles(
    dateCondition: FindOperator<Date>,
  ): Promise<CleanUpResultDto> {
    const unusedGpxFilesCondition = new Brackets((qb) => {
      qb.where('tour.gpxFileId IS NULL').andWhere({
        createdAt: dateCondition,
      });
    });
    const gpxFilesToClean = await this.gpxFileRepository
      .createQueryBuilder('gpxFile')
      .leftJoinAndSelect('gpxFile.tour', 'tour')
      .where(unusedGpxFilesCondition)
      .orWhere({ user: null })
      .getMany();

    const gpxFileIdentifiers = gpxFilesToClean.map(
      (gpxFile) => gpxFile.identifier,
    );

    if (gpxFilesToClean.length > 0) {
      const deletedFromStorage = await this.storageProvider.deleteMany(
        gpxFileIdentifiers,
      );
      const deletedFromDb = await this.gpxFileRepository.delete(
        gpxFilesToClean.map((gpxFile) => gpxFile.id),
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
