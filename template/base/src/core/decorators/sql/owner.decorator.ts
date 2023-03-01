import { User } from '@core/common/modules/sql/user/entities/user.entity';
import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export interface Session {
  sessionId: string;
  userId: number;
  iat: number;
  exp: number;
  info?: any;
}

export type OwnerDto = Partial<Session> & Partial<User>;

/**
 * Decorator for fetching user from Request object
 *
 * user object will be available for controller's methods as a parameter
 *```js
 * @User() user: any
 * ```
 * @return {object} user - req.user object
 */
export const Owner = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);
