import {
  Injectable,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import type { CreateUserDto, AuthDto } from '../users/users.dto';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async register({ email, password, name }: CreateUserDto) {
    const existingUser = await this.usersService.findByEmail(email);
    if (existingUser) {
      throw new ConflictException('Email already in use');
    }

    const saltRounds = 10;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    const hashedPassword: string = await bcrypt.hash(password, saltRounds);

    return this.usersService.create({
      email,
      name,
      password: hashedPassword,
    });
  }

  async login({ email, password }: AuthDto) {
    const user = await this.usersService.findByEmail(email);

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    const isPasswordValid: boolean = await bcrypt.compare(
      password,
      user.password,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Generate JWT Payload
    const payload = { sub: user.id, email: user.email };

    return {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
      access_token: await this.jwtService.signAsync(payload),
      user: {
        id: user.id,
        email: user.email,
      },
    };
  }
}
