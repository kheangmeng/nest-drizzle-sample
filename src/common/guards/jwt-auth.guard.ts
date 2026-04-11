/* eslint-disable @typescript-eslint/no-unused-vars */
import { Injectable, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  canActivate(context: ExecutionContext) {
    // You can add custom authentication logic here before calling super
    return super.canActivate(context);
  }

  handleRequest(err: any, user: any, info: any): any {
    // Custom error handling if token is invalid or missing
    if (err || !user) {
      throw err || new UnauthorizedException('Invalid or missing authentication token');
    }
    return user;
  }
}
