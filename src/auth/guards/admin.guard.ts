import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { User, UserRole } from '../../user/entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

/**
 * This guard ensures only users with role === UserRole.ADMINISTRATOR may access
 * a given route. Since JWTs cannot be revoked, we need to check the user's
 * role, as an administrator might be degraded to normal user, which must not be
 * reflected in their active auth tokens.
 */
@Injectable()
export class AdminGuard implements CanActivate {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
  ) {}

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

    try {
      await this.userRepository.findOneOrFail({
        where: [{ email: user.email, role: user.role }],
      });
      return true;
    } catch (e) {
      /*
       This could only happen if either the database threw some error or if
       the user supplied a valid JWT where he was administrator, but his admin
       rights have been revoked in the meantime.
      */
      return false;
    }
  }
}
