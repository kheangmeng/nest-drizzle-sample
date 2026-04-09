import { Module } from '@nestjs/common';
import { PaymentService } from './payments.service';

@Module({
  providers: [PaymentService],
  exports: [PaymentService],
})
export class PaymentsModule {}
