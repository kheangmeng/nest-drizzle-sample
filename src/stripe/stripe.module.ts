import { Module } from '@nestjs/common';
import { StripeService } from './stripe.service';

@Module({
  providers: [StripeService],
  exports: [StripeService], // Export so PaymentsModule can use it
})
export class StripeModule {}
