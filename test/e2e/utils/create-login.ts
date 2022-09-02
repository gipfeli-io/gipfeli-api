import { AuthService } from '../../../src/auth/auth.service';
import { UserDto } from '../../../src/user/dto/user.dto';
import { TokenDto } from '../../../src/auth/dto/auth.dto';
import { User } from '../../../src/user/entities/user.entity';

/**
 * Creates a fake login for a given user and returns its tokens.
 * @param authService
 * @param user
 */
const createLogin: (
  authService: AuthService,
  user: User,
) => Promise<TokenDto> = async (authService: AuthService, user: UserDto) => {
  const sessionId = await authService.createSession(user.id);

  return authService.createTokenResponse(
    user.id,
    user.email,
    sessionId,
    user.role,
  );
};

export default createLogin;
