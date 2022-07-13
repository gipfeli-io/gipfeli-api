import { DeleteResult } from 'typeorm';
import { BatchStorageOperationStatistics } from '../providers/types/storage-provider';

export interface CleanUpResult {
  database: DeleteResult;
  storage: BatchStorageOperationStatistics;
}
