import { Body, Controller, Post, UsePipes, Logger } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import type { AuthUser, CreateUser } from '../users/users';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import {
  createUserSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  refreshTokenSchema,
  loginSchema,
} from '../users/users.schema';
import {
  CreateUserDto,
  ForgotPasswordDto,
  ResetPasswordDto,
  RefreshTokenDto,
  LoginDto,
} from '../users/users.dto';
import { UsersService } from 'src/users/users.service';

// Note: In production, create proper DTO classes with @nestjs/swagger and class-validator
@ApiTags('auth') // Groups these endpoints under "auth" in Swagger UI
@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(
    private readonly authService: AuthService,
    private readonly user: UsersService,
  ) {}

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

  @Post('forgot-password')
  @ApiOperation({ summary: 'Request password reset' })
  @ApiBody({ type: ForgotPasswordDto })
  @ApiResponse({ status: 200, description: 'Reset token generated.' })
  @UsePipes(new ZodValidationPipe(forgotPasswordSchema))
  async forgotPassword(@Body() body: ForgotPasswordDto) {
    this.logger.log(`Forgot password request for: ${body.email}`);
    const token = await this.user.forgotPassword(body.email);
    console.log(token);
    // In a real app, you would send this via email.
    return { message: 'If the email exists, a reset link has been sent.', token };
  }

  @Post('reset-password')
  @ApiOperation({ summary: 'Reset password using token' })
  @ApiBody({ type: ResetPasswordDto })
  @ApiResponse({ status: 200, description: 'Password reset successful.' })
  @UsePipes(new ZodValidationPipe(resetPasswordSchema))
  async resetPassword(@Body() body: ResetPasswordDto) {
    await this.user.resetPassword(body.token, body.password);
    return { message: 'Password has been successfully reset.' };
  }

  @Post('refresh-token')
  @ApiOperation({ summary: 'Refresh session' })
  @ApiBody({ type: RefreshTokenDto })
  @UsePipes(new ZodValidationPipe(refreshTokenSchema))
  async refresh(@Body() body: RefreshTokenDto) {
    return this.authService.refreshToken(body.refreshToken);
  }
}
