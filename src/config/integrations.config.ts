import { registerAs } from '@nestjs/config';

export default registerAs('integrations', () => ({
  sendGrid: {
    sender: process.env.SENDGRID_SENDER,
    apiKey: process.env.SENDGRID_API_KEY,
  },
  sentry: {
    dsn: process.env.SENTRY_DSN,
  },
  googleCloudStorage: {
    bucketName: process.env.GCS_BUCKET,
    /**
     * The credentials should contain a base64 encoded key file linked to a service account that has object.create
     * rights on the specified buckets. Note that in Cloud Run environments, this environment variable does not have to
     * be set, because the client library takes the currently running cloud user. So only  our Cloud Run service account
     * needs to have access.
     */
    credentials: process.env.GCS_SERVICE_ACCOUNT
      ? JSON.parse(
          Buffer.from(process.env.GCS_SERVICE_ACCOUNT, 'base64').toString(),
        )
      : null,
  },
}));
