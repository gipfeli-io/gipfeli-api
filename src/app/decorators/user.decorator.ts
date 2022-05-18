import { createParamDecorator, ExecutionContext } from '@nestjs/common';

/**
 * Extract the user from a validated request.
 */
export const User = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);
