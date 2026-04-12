/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Processor, Process } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { type Job } from 'bull';

@Processor('payments-queue')
export class PaymentsProcessor {
  private readonly logger = new Logger(PaymentsProcessor.name);

  @Process('process-webhook')
  handlePaymentWebhook(job: Job<any>) {
    const event = job.data;
    this.logger.log(`Processing payment webhook event type: ${event.type}`);

    if (event.type === 'payment_intent.succeeded') {
      const orderId = event.data.object.metadata.orderId;

      this.logger.log(`Payment successful for Order ID: ${orderId}. Updating DB...`);
      // 1. Update Order Status in DB to 'PAID'
      // 2. Update Payment transaction status to 'SUCCESS'
      // 3. Perhaps push another job to orders-queue to "dispatch-shipping"
    }

    if (event.type === 'payment_intent.payment_failed') {
      const orderId = event.data.object.metadata.orderId;
      this.logger.warn(`Payment failed for Order ID: ${orderId}. Alerting user...`);
      // 1. Update Order Status to 'FAILED'
    }
  }
}
