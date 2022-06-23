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
    credentials: process.env.GCS_SERVICE_ACCOUNT
      ? JSON.parse(
          Buffer.from(process.env.GCS_SERVICE_ACCOUNT, 'base64').toString(),
        )
      : {},
  },
}));
