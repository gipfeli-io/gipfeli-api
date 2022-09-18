import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { UserRole } from '../../user/entities/user.entity';
import { AuthService } from '../auth.service';

/**
 * This guard ensures only users with role === UserRole.ADMINISTRATOR may access
 * a given route. Since JWTs cannot be revoked, we need to check the user's
 * role, as an administrator might be degraded to normal user, which must not
 * always be directly reflected in their active auth tokens.
 */
@Injectable()
export class AdminGuard implements CanActivate {
  constructor(private readonly authService: AuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const { user } = request;

    if (
      user === undefined ||
      user.role === undefined ||
      user.role !== UserRole.ADMINISTRATOR
    ) {
      return false;
    }

    return this.authService.isUserAdministrator(user.email);
  }
}
