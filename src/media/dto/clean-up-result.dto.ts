import { DeleteResult } from 'typeorm';
import { BatchStorageOperationStatistics } from '../providers/types/storage-provider';

const emptyDbCleanUp: DeleteResult = {
  affected: 0,
  raw: null,
};

const emptyStorageCleanUp: BatchStorageOperationStatistics = {
  totalOperations: 0,
  errors: [],
  successfulOperations: 0,
};

export class CleanUpResultDto {
  database: DeleteResult;
  storage: BatchStorageOperationStatistics;

  constructor(
    deletedFromDb: DeleteResult = emptyDbCleanUp,
    deletedFromStorage: BatchStorageOperationStatistics = emptyStorageCleanUp,
  ) {
    this.database = deletedFromDb;
    this.storage = deletedFromStorage;
  }
}
