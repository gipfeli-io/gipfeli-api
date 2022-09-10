import { registerAs } from '@nestjs/config';

export default registerAs('media', () => ({
  maxFileSize: process.env.MAX_FILE_SIZE || 2097152,
  cleanUpToken: process.env.CLEAN_UP_TOKEN,
}));
