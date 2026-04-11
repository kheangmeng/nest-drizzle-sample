import { SetMetadata } from '@nestjs/common';

// A constant key to store metadata
export const ROLES_KEY = 'roles';

// The @Roles() decorator takes a list of allowed roles and attaches them to the route
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);
