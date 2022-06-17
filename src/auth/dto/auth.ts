export class LoginDto {
  access_token: string;
  refresh_token: string;
}

export interface UserIdentifier {
  sub: string;
  email: string;
}

interface JwtTokenPayloadBase {
  iat: number;
  exp: number;
}

export interface RefreshToken extends JwtTokenPayloadBase {
  sessionId: string;
}

export interface AuthToken extends JwtTokenPayloadBase, UserIdentifier {}
