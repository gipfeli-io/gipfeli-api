import { Injectable } from '@nestjs/common';
import { StorageProvider } from '../types/storage-provider';

@Injectable()
export class GoogleCloudStorageProvider implements StorageProvider {
  put(file: string): Promise<boolean> {
    console.log('uploading ' + file);
    return Promise.resolve(false);
  }
}
