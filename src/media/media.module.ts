import { Module, Provider } from '@nestjs/common';
import { MediaService } from './media.service';
import { MediaController } from './media.controller';
import { StorageProviderInterface } from './providers/types/storage-provider';
import { GoogleCloudStorageProvider } from './providers/google-cloud-storage/google-cloud-storage-provider';

const storageProvider: Provider = {
  provide: StorageProviderInterface,
  useClass: GoogleCloudStorageProvider,
};

@Module({
  controllers: [MediaController],
  providers: [MediaService, storageProvider],
})
export class MediaModule {}
