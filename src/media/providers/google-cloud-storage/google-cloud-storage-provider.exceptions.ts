/**
 * This generic error class is captured by nest's errorhandler as a 500 message,
 * but we can still log the actual GCP error to sentry.
 */
export class GoogleCloudStorageException extends Error {}
