/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Processor, Process } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { type Job } from 'bull';
import { TelegramService } from '../telegram/telegram.service';

@Processor('payments-queue')
export class PaymentsProcessor {
  private readonly logger = new Logger(PaymentsProcessor.name);

  constructor(private telegramService: TelegramService) {}

  @Process('process-webhook')
  async handlePaymentWebhook(job: Job<any>) {
    const event = job.data;
    this.logger.log(`Processing payment webhook event type: ${event.type}`);

    // Assuming this is a Stripe-like webhook payload
    if (event.type === 'payment_intent.created') {
      const amount = (event.data.object.amount / 100).toFixed(2); // Convert cents to dollars
      const currency = event.data.object.currency.toUpperCase();

      // Fire Telegram notification for payment creation
      await this.telegramService.sendMessage(
        `🆕 <b>New Payment Initiated</b>\n\n💰 Amount: ${amount} ${currency}\n🆔 ID: <code>${event.data.object.id}</code>`,
      );
    }

    if (event.type === 'payment_intent.succeeded') {
      const orderId = event.data.object.metadata?.orderId || 'N/A';
      const amount = (event.data.object.amount / 100).toFixed(2);

      this.logger.log(`Payment successful for Order ID: ${orderId}. Updating DB...`);
      // 1. Update Order Status in DB to 'PAID'
      // 2. Update Payment transaction status to 'SUCCESS'
      // 3. Perhaps push another job to orders-queue to "dispatch-shipping"

      await this.telegramService.sendMessage(
        `✅ <b>Payment Successful!</b>\n\n🛒 Order ID: ${orderId}\n💵 Amount: ${amount}\n🎉 Time to ship the goods!`,
      );
    }

    if (event.type === 'payment_intent.payment_failed') {
      const orderId = event.data.object.metadata.orderId;
      this.logger.warn(`Payment failed for Order ID: ${orderId}. Alerting user...`);
      // 1. Update Order Status to 'FAILED'
    }
  }
}
