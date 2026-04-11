import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../../users/users.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    private usersService: UsersService,
  ) {
    super({
      // Extract the JWT from the "Authorization: Bearer <token>" header
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET')!,
    });
  }

  // This method runs automatically if the token signature is valid and not expired.
  // The 'payload' is the decoded JSON from the JWT.
  async validate(payload: { sub: number; email: string }) {
    // Optional but recommended: Fetch the user from DB to ensure they haven't been deleted
    // and to get their most up-to-date role.
    const user = await this.usersService.findById(payload.sub);

    if (!user) {
      throw new UnauthorizedException('User no longer exists');
    }

    // Returning this object attaches it to the Request object (req.user)
    return {
      id: user.id,
      email: user.email,
      role: user.role, // Attach role for the RolesGuard to use
    };
  }
}
