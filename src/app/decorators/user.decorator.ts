import { createParamDecorator, ExecutionContext } from '@nestjs/common';

/**
 * This decorator extracts the user from a validated request and can be used to inject the user into any controller
 * handler.
 */
export const User = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);
