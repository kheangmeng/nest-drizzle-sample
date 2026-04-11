import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { ROLES_KEY } from '../decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // 1. Get the required roles from the route's @Roles() decorator
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // 2. If no roles are specified, allow access (or you could strictly deny it)
    if (!requiredRoles) {
      return true;
    }

    // 3. Get the user from the request (attached by JwtAuthGuard)
    const request = context.switchToHttp().getRequest<Request & { user: any }>();
    const user = request.user as { role: string };

    if (!user || !user.role) {
      throw new ForbiddenException('User role not found');
    }

    // 4. Check if the user's role is in the required roles list
    const hasRole = requiredRoles.includes(user.role);

    if (!hasRole) {
      throw new ForbiddenException('You do not have permission to access this resource');
    }

    return true;
  }
}
