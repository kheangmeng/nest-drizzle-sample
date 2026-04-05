import { Body, Controller, Post, UsePipes, Logger } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import type { AuthUser, CreateUser } from '../users/users';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import { createUserSchema, loginSchema } from '../users/users.schema';
import { CreateUserDto, LoginDto } from '../users/users.dto';

// Note: In production, create proper DTO classes with @nestjs/swagger and class-validator
@ApiTags('auth') // Groups these endpoints under "auth" in Swagger UI
@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiOperation({ summary: 'Register a new user' })
  @ApiBody({ type: CreateUserDto })
  @ApiResponse({ status: 201, description: 'User successfully created.' })
  @ApiResponse({ status: 400, description: 'Validation failed.' })
  @ApiResponse({ status: 409, description: 'Email already in use.' })
  @UsePipes(new ZodValidationPipe(createUserSchema))
  async register(@Body() body: CreateUser) {
    const user = {
      name: body.name,
      email: body.email,
      password: body.password,
    };
    this.logger.log(`Received registration request for: ${body.email}`);

    return this.authService.register(user);
  }

  @Post('login')
  @ApiOperation({ summary: 'Login and receive tokens' })
  @ApiBody({ type: LoginDto })
  @ApiResponse({ status: 200, description: 'Successfully logged in.' })
  @UsePipes(new ZodValidationPipe(loginSchema))
  async login(@Body() body: AuthUser) {
    const user = {
      email: body.email,
      password: body.password,
    };
    this.logger.log(`Received login request for: ${body.email}`);

    return this.authService.login(user);
  }
}
