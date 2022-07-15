import { Injectable } from '@nestjs/common';
import {
  BatchStorageOperationStatistics,
  StorageProvider,
  UploadedFileHandle,
} from '../types/storage-provider';
import { Bucket, Storage } from '@google-cloud/storage';
import { ConfigService } from '@nestjs/config';
import { UploadFileDto } from '../../dto/file';
import { randomUUID } from 'crypto';
import slugify from 'slugify';
import { GoogleCloudStorageException } from './google-cloud-storage-provider.exceptions';

@Injectable()
export class GoogleCloudStorageProvider implements StorageProvider {
  private readonly storage: Storage;
  private readonly bucket: Bucket;

  constructor(private readonly configService: ConfigService) {
    const credentials = this.configService.get(
      'integrations.googleCloudStorage.credentials',
    );
    const bucketName = this.configService.get(
      'integrations.googleCloudStorage.bucketName',
    );

    this.storage = new Storage({ credentials });
    this.bucket = this.storage.bucket(bucketName);
  }

  async put(path: string, file: UploadFileDto): Promise<UploadedFileHandle> {
    const destination = this.getFullFilePath(path, file.originalname);

    const gcsFile = this.bucket.file(destination);
    try {
      await gcsFile.save(file.buffer, {
        contentType: file.mimetype,
      });
    } catch (error) {
      throw new GoogleCloudStorageException(error.message);
    }

    return { identifier: gcsFile.name, metadata: gcsFile.metadata };
  }

  async deleteMany(
    identifiers: string[],
  ): Promise<BatchStorageOperationStatistics> {
    const totalOperations = identifiers.length;
    const errors: string[] = [];
    let successfulOperations = 0;
    for (const identifier of identifiers) {
      try {
        await this.bucket.file(identifier).delete();
        successfulOperations++;
      } catch (e) {
        errors.push(e.message);
      }
    }

    return { totalOperations, successfulOperations, errors };
  }

  /**
   * Returns the full path for the file, including its name.
   * @param path
   * @param fileName
   * @private
   */
  private getFullFilePath(path: string, fileName: string): string {
    const uniqueFileName = this.getFileName(fileName);
    return `${path}/${uniqueFileName}`;
  }

  /**
   * Generates a unique filename by creating a UUID that is prepended to the
   * slugified original filename.
   * @param fileName
   * @private
   */
  private getFileName(fileName: string): string {
    const uuid = randomUUID();
    const slugifiedFileName = slugify(fileName, { lower: true, strict: true });

    return `${uuid}_${slugifiedFileName}`;
  }
}
