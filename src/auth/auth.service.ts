import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import * as crypto from 'node:crypto';
import { UsersService } from '../users/users.service';
import type { CreateUser, AuthUser } from '../users/users';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async register({ email, password, name }: CreateUser) {
    const existingUser = await this.usersService.findByEmail(email);
    if (existingUser) {
      throw new ConflictException('Email already in use');
    }

    const saltRounds = 10;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    const hashedPassword: string = await bcrypt.hash(password, saltRounds);
    const token = crypto.randomBytes(32).toString('hex');
    const refreshToken = crypto.createHash('sha256').update(token).digest('hex');

    return this.usersService.create({
      email,
      name,
      password: hashedPassword,
      refreshToken,
    });
  }

  async login({ email, password }: AuthUser) {
    const user = await this.usersService.findByEmail(email);

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    const isPasswordValid: boolean = await bcrypt.compare(password, user.password);
    const token = crypto.randomBytes(32).toString('hex');
    const refreshToken = crypto.createHash('sha256').update(token).digest('hex');

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    await this.usersService.updateRefreshToken(user.id, refreshToken);

    // Generate JWT Payload
    const payload = { sub: user.id, email: user.email };

    return {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
      access_token: await this.jwtService.signAsync(payload),
      refresh_token: refreshToken,
      user: {
        id: user.id,
        email: user.email,
      },
    };
  }

  async refreshToken(refreshToken: string) {
    const user = await this.usersService.findByRefreshToken(refreshToken);

    if (!user) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const token = crypto.randomBytes(32).toString('hex');
    const _refreshToken = crypto.createHash('sha256').update(token).digest('hex');

    await this.usersService.updateRefreshToken(user.id, _refreshToken);

    // Generate JWT Payload
    const payload = { sub: user.id, email: user.email };

    return {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
      access_token: await this.jwtService.signAsync(payload),
      refresh_token: _refreshToken,
      user: {
        id: user.id,
        email: user.email,
      },
    };
  }
}
