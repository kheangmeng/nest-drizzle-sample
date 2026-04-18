import {
  Body,
  Controller,
  Param,
  Delete,
  Post,
  Get,
  UsePipes,
  UseGuards,
  Logger,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { UsersService } from './users.service';
import type { CreateUser } from './users';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import { createUserSchema } from './users.schema';
import { CreateUserDto } from './users.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';

// Note: In production, create proper DTO classes with @nestjs/swagger and class-validator
@ApiTags('users')
@ApiBearerAuth() // Tells Swagger to add the Bearer token UI
@Controller('users')
// Apply Guards globally to this controller.
// JwtAuthGuard runs FIRST to get the user. RolesGuard runs SECOND to check the role.
@UseGuards(JwtAuthGuard, RolesGuard)
export class UserController {
  private readonly logger = new Logger(UserController.name);

  constructor(private readonly user: UsersService) {}

  @Get()
  @Roles('admin', 'staff')
  @ApiOperation({ summary: 'User list' })
  @ApiBody({ type: CreateUserDto })
  @ApiResponse({ status: 200, description: 'Successfully logged in.' })
  async getAllUsers(@Query() query: { limit?: string; offset?: string }) {
    this.logger.log(`Get users request`);

    return this.user.getUsers(query);
  }

  @Post()
  @Roles('admin', 'staff')
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

  @Delete(':id')
  @Roles('admin')
  @ApiOperation({ summary: 'Delete a user (Admin Only)' })
  async deleteUser(@Param('id') id: string) {
    await this.user.delete(+id);
    this.logger.log(`Delete user request for: ${id}`);

    return { message: `User ${id} deleted successfully by admin` };
  }
}
