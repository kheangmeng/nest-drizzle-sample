import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { MailModule } from '../mail/mail.module';

@Module({
  providers: [UsersService],
  exports: [UsersService], // Exported so AuthModule can use it
  imports: [MailModule],
})
export class UsersModule {}
