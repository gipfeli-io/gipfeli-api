import { Module, Provider } from '@nestjs/common';
import { MediaService } from './media.service';
import { MediaController } from './media.controller';
import { StorageProviderInterface } from './providers/types/storage-provider';
import { GoogleCloudStorageProvider } from './providers/google-cloud-storage/google-cloud-storage-provider';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MulterModule } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Image } from './entities/image.entity';
import { GeoReferenceProviderInterface } from './providers/types/geo-reference-provider';
import { ExifrProvider } from './providers/exifr/exifr-provider';

const storageProvider: Provider = {
  provide: StorageProviderInterface,
  useClass: GoogleCloudStorageProvider,
};

const geoReferenceProvider: Provider = {
  provide: GeoReferenceProviderInterface,
  useClass: ExifrProvider,
};

@Module({
  imports: [
    TypeOrmModule.forFeature([Image]),
    ConfigModule,
    MulterModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        return {
          storage: memoryStorage(),
          limits: {
            fileSize: configService.get<number>('media.maxFileSize'),
          },
        };
      },
      inject: [ConfigService],
    }),
  ],
  controllers: [MediaController],
  providers: [MediaService, storageProvider, geoReferenceProvider],
})
export class MediaModule {}
