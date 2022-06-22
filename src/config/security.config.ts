import { registerAs } from '@nestjs/config';

export default registerAs('security', () => ({
  corsOrigin: process.env.CORS_ORIGIN,
  noOfHashRounds: parseInt(process.env.NO_OF_ROUNDS),
  authTokenValidity: parseInt(process.env.AUTH_TOKEN_VALIDITY),
  refreshTokenValidity: parseInt(process.env.REFRESH_TOKEN_VALIDITY),
  jwtSecret: process.env.JWT_SECRET,
}));
