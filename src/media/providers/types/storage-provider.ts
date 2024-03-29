import { UploadFileDto } from '../../dto/file.dto';

export interface UploadedFileHandle {
  /**
   * The unique identifier that is used by the provider to designate an uploaded
   * file.
   */
  identifier: string;

  /**
   * Any kind of metadata that may be used by the service to perform further
   * actions.
   */
  metadata?: any;
}

export interface BatchStorageOperationStatistics {
  totalOperations: number;
  successfulOperations: number;
  errors: string[];
}

export interface StorageProvider {
  /**
   * Store an uploaded file to a given path
   * @param path
   * @param file
   */
  put: (path: string, file: UploadFileDto) => Promise<UploadedFileHandle>;

  /**
   * Deletes a list of identifiers from the storage
   * @param identifiers
   */
  deleteMany: (
    identifiers: string[],
  ) => Promise<BatchStorageOperationStatistics>;
}

/**
 * Used by nestjs to inject the correct provider.
 */
export const StorageProviderInterface = Symbol('StorageProviderInterface');
