import { registerAs } from '@nestjs/config';

export default registerAs('environment', () => ({
  environment: process.env.ENVIRONMENT || 'localhost',
  appUrl: process.env.APP_URL || 'http://localhost:3001/',
  port: parseInt(process.env.PORT) || 3000,
}));
