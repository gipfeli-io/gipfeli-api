import { registerAs } from '@nestjs/config';

export default registerAs('security', () => ({
  corsOrigin: process.env.CORS_ORIGIN,
  noOfHashRounds: parseInt(process.env.NO_OF_ROUNDS),
  authTokenValidity: parseInt(process.env.AUTH_TOKEN_VALIDITY) || 10,
  refreshTokenValidity: parseInt(process.env.REFRESH_TOKEN_VALIDITY) || 43200,
  jwtSecret: process.env.JWT_SECRET,
  throttleTtl: parseInt(process.env.THROTTLE_TTL) || 60,
  throttleLimit: parseInt(process.env.THROTTLE_LIMIT) || 30,
}));
