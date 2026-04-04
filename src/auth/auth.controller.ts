import { Body, Controller, Post, UsePipes, Logger } from '@nestjs/common';
import { AuthService } from './auth.service';
import type { AuthDto, CreateUserDto } from '../users/users';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import { createUserSchema, loginSchema } from '../users/users.schema';

// Note: In production, create proper DTO classes with @nestjs/swagger and class-validator
@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @UsePipes(new ZodValidationPipe(createUserSchema))
  async register(@Body() body: CreateUserDto) {
    const user = {
      name: body.name,
      email: body.email,
      password: body.password,
    };
    this.logger.log(`Received registration request for: ${body.email}`);

    return this.authService.register(user);
  }

  @Post('login')
  @UsePipes(new ZodValidationPipe(loginSchema))
  async login(@Body() body: AuthDto) {
    const user = {
      email: body.email,
      password: body.password,
    };
    this.logger.log(`Received login request for: ${body.email}`);

    return this.authService.login(user);
  }
}
