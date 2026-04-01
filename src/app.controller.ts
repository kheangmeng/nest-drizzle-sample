import { Body, Controller, Get, Post } from '@nestjs/common';
import { AppService } from './app.service';

// DTO for user creation (in a real app, use class-validator)
class CreateUserDto {
  name: string;
  email: string;
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
    return this.appService.createUser(body.name, body.email);
  }

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
}
