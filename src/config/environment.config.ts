import { registerAs } from '@nestjs/config';
import { NotificationRecipient } from '../notification/types/notification-service';

export default registerAs('environment', () => ({
  environment: process.env.ENVIRONMENT || 'localhost',
  appUrl: process.env.APP_URL || 'http://localhost:3001/',
  port: parseInt(process.env.PORT) || 3000,
  adminContacts: (process.env.ADMIN_CONTACTS?.split(',').map((email) => ({
    email,
  })) || []) as NotificationRecipient[],
}));
