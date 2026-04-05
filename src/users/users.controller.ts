import { Body, Controller, Post, Get, UsePipes, Logger } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { UsersService } from './users.service';
import type { CreateUser } from './users';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import { createUserSchema } from './users.schema';
import { CreateUserDto } from '../users/users.dto';

// Note: In production, create proper DTO classes with @nestjs/swagger and class-validator
@ApiTags('users')
@Controller('users')
export class UserController {
  private readonly logger = new Logger(UserController.name);

  constructor(private readonly user: UsersService) {}

  @Get()
  @ApiOperation({ summary: 'User list' })
  @ApiBody({ type: CreateUserDto })
  @ApiResponse({ status: 200, description: 'Successfully logged in.' })
  async getAllUsers() {
    this.logger.log(`Get users request`);

    return this.user.getUsers();
  }

  @Post()
  @ApiOperation({ summary: 'Create a new user' })
  @ApiBody({ type: CreateUserDto })
  @ApiResponse({ status: 201, description: 'User successfully created.' })
  @ApiResponse({ status: 400, description: 'Validation failed.' })
  @ApiResponse({ status: 409, description: 'Email already in use.' })
  @UsePipes(new ZodValidationPipe(createUserSchema))
  async createUser(@Body() body: CreateUser) {
    const user = {
      name: body.name,
      email: body.email,
      password: body.password,
    };
    this.logger.log(`Create user request for: ${body.email}`);

    return this.user.create(user);
  }
}
