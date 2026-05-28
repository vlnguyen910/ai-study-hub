import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import type { Request } from 'express';

export type RequestUser = {
  sub: string;
  email: string;
  role?: UserRole;
};

export const User = createParamDecorator(
  (data: keyof RequestUser | undefined, ctx: ExecutionContext) => {
    const request = ctx
      .switchToHttp()
      .getRequest<Request & { user?: RequestUser }>();
    const user = request.user;

    if (!data) {
      return user;
    }

    return user?.[data];
  },
);
