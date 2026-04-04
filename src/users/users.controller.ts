import { Body, Controller, Post, Get, UsePipes, Logger } from '@nestjs/common';
import { UsersService } from './users.service';
import type { CreateUserDto } from './users';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import { createUserSchema } from './users.schema';

// Note: In production, create proper DTO classes with @nestjs/swagger and class-validator
@Controller('users')
export class UserController {
  private readonly logger = new Logger(UserController.name);

  constructor(private readonly user: UsersService) {}

  @Get()
  async getAllUsers() {
    this.logger.log(`Get users request`);

    return this.user.getUsers();
  }

  @Post()
  @UsePipes(new ZodValidationPipe(createUserSchema))
  async createUser(@Body() body: CreateUserDto) {
    const user = {
      name: body.name,
      email: body.email,
      password: body.password,
    };
    this.logger.log(`Create user request for: ${body.email}`);

    return this.user.create(user);
  }
}
