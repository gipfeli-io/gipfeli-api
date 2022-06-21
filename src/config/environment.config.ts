import { registerAs } from '@nestjs/config';

export default registerAs('environment', () => ({
  environment: process.env.ENVIRONMENT,
  appUrl: process.env.APP_URL || 'http://localhost:3001/',
}));
