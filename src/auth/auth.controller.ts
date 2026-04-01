import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import type { AuthDto, CreateUserDto } from '../users/users.dto';

// Note: In production, create proper DTO classes with @nestjs/swagger and class-validator
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(@Body() body: CreateUserDto) {
    const user = {
      name: body.name,
      email: body.email,
      password: body.password,
    };

    return this.authService.register(user);
  }

  @Post('login')
  async login(@Body() body: AuthDto) {
    const user = {
      email: body.email,
      password: body.password,
    };

    return this.authService.login(user);
  }
}
