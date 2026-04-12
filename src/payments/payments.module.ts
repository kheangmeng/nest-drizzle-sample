import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { PaymentService } from './payments.service';
import { PaymentController } from './payments.controller';
import { OrdersModule } from 'src/orders/orders.module';
import { PaymentsProcessor } from './payments.processor';
import { MailModule } from '../mail/mail.module';

@Module({
  providers: [PaymentService, PaymentsProcessor],
  exports: [PaymentService],
  imports: [
    MailModule,
    OrdersModule,
    BullModule.registerQueue({
      name: 'payments-queue',
    }),
  ],
  controllers: [PaymentController],
})
export class PaymentsModule {}
