import { Module } from '@nestjs/common';
import { PaymentService } from './payments.service';
import { OrdersModule } from 'src/orders/orders.module';

@Module({
  providers: [PaymentService],
  exports: [PaymentService],
  imports: [OrdersModule],
})
export class PaymentsModule {}
