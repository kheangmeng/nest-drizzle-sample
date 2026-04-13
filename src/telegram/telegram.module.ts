import { Module, Global } from '@nestjs/common';
import { TelegramService } from './telegram.service';

@Global() // Made global so it can be easily used across Orders, Payments, etc.
@Module({
  providers: [TelegramService],
  exports: [TelegramService],
})
export class TelegramModule {}
