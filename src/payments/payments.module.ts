import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { PaymentService } from './payments.service';
import { PaymentController } from './payments.controller';
import { OrdersModule } from 'src/orders/orders.module';
import { PaymentsProcessor } from './payments.processor';
import { MailModule } from '../mail/mail.module';
import { StripeModule } from '../stripe/stripe.module';
import { PaypalModule } from '../paypal/paypal.module';

@Module({
  providers: [PaymentService, PaymentsProcessor],
  exports: [PaymentService],
  imports: [
    MailModule,
    OrdersModule,
    StripeModule,
    PaypalModule,
    BullModule.registerQueue({
      name: 'payments-queue',
    }),
  ],
  controllers: [PaymentController],
})
export class PaymentsModule {}
