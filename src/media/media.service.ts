import { Inject, Injectable } from '@nestjs/common';
import {
  StorageProvider,
  StorageProviderInterface,
} from './providers/types/storage-provider';

@Injectable()
export class MediaService {
  constructor(
    @Inject(StorageProviderInterface)
    private readonly storageProvider: StorageProvider,
  ) {}

  async debug() {
    await this.storageProvider.put('test');
  }
}
