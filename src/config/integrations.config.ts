import { registerAs } from '@nestjs/config';

export default registerAs('integrations', () => ({
  sendGrid: {
    sender: process.env.SENDGRID_SENDER,
    apiKey: process.env.SENDGRID_API_KEY,
  },
  sentry: {
    dsn: process.env.SENTRY_DSN,
  },
}));
