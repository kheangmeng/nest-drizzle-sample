import { Body, Controller, Get, Post } from '@nestjs/common';
import { AppService } from './app.service';

// DTO for user creation (in a real app, use class-validator)
class CreateUserDto {
  name: string;
  email: string;
  password: string;
}
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  async getAllUsers() {
    return this.appService.getUsers();
  }

  @Post()
  async createUser(@Body() body: CreateUserDto) {
    const user = {
      name: body.name,
      email: body.email,
      password: body.password,
    };

    return this.appService.createUser(user);
  }

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
}
