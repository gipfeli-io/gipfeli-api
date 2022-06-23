export interface StorageProvider {
  put: (file: string) => Promise<boolean>;
}

/**
 * Used by nestjs to inject the correct provider.
 */
export const StorageProviderInterface = Symbol('StorageProviderInterface');
