import { Module } from '@nestjs/common';
import { PaypalService } from './paypal.service';

@Module({
  providers: [PaypalService],
  exports: [PaypalService], // Exported so PaymentsModule can use it
})
export class PaypalModule {}
