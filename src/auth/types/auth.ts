/**
 * Basic JwtTokenPayload that is part of all JWTs.
 */
import { UserRole } from '../../user/entities/user.entity';

interface JwtTokenPayloadBase {
  iat: number;
  exp: number;
}

/**
 * In tokens, this UserIdentifier is the payload.
 */
export interface UserIdentifier {
  sub: string;
  email: string;
  role: UserRole;
}

/**
 * In tokens, this SessionIdentifier is the payload.
 */
export interface SessionIdentifier {
  sessionId: string;
}

/**
 * A successful token refresh returns both UserIdentifier and SessionIdentifier.
 */
export interface RefreshedToken extends UserIdentifier, SessionIdentifier {}

/**
 * RefreshTokenRequest contains a session ID that maps to a UserSession object.
 * If a user sends another JWT (e.g. accesstoken), the sessionId is undefined
 * and we can act accordingly.
 */
export interface RefreshTokenRequest
  extends JwtTokenPayloadBase,
    SessionIdentifier {
  sessionId: string | undefined;
}

/**
 * The main authtoken.
 */
export interface AuthToken extends JwtTokenPayloadBase, UserIdentifier {}
