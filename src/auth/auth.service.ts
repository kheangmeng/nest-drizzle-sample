import { Injectable, UnauthorizedException, ConflictException, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import * as crypto from 'node:crypto';
import { UsersService } from '../users/users.service';
import type { CreateUser, AuthUser } from '../users/users';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
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

  async validateOAuthLogin(googleUser: { email: string; googleId: string }) {
    let user = await this.usersService.findByEmail(googleUser.email);

    if (!user) {
      // Create new user if they don't exist
      this.logger.log(`Creating new user from Google OAuth: ${googleUser.email}`);
      user = await this.usersService.create({
        email: googleUser.email,
        googleId: googleUser.googleId,
      });
    } else if (!user.googleId) {
      // Link Google account if user already registered via email/password
      this.logger.log(`Linking Google account to existing user: ${user.email}`);
      await this.usersService.update(user.id, { googleId: googleUser.googleId });
    }

    const tokens = await this.getTokens(user.id, user.email);
    await this.updateRefreshToken(user.id, tokens.refreshToken);
    return tokens;
  }

  async login({ email, password }: AuthUser) {
    const user = await this.usersService.findByEmail(email);

    if (!user || !user.password) {
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

  private async getTokens(userId: number, email: string) {
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(
        { sub: userId, email },
        { secret: this.configService.get('JWT_SECRET'), expiresIn: '15m' },
      ),
      this.jwtService.signAsync(
        { sub: userId, email },
        { secret: this.configService.get('JWT_REFRESH_SECRET'), expiresIn: '7d' },
      ),
    ]);
    return { accessToken, refreshToken };
  }

  private async updateRefreshToken(userId: number, refreshToken: string) {
    const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);
    await this.usersService.update(userId, { refreshToken: hashedRefreshToken });
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
