import { Module } from '@nestjs/common';
import { MailService } from './mail.service'; // Adjust path if MailService is in a different location

@Module({
  providers: [MailService],
  exports: [MailService], // Export MailService to be available for other modules
})
export class MailModule {}
