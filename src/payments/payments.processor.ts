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
    const { provider, event } = job.data;
    this.logger.log(`Processing payment webhook event type: ${event.type}`);

    // --- STRIPE LOGIC ---
    if (provider === 'stripe') {
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
    }

    if (event.type === 'payment_intent.payment_failed') {
      const orderId = event.data.object.metadata.orderId;
      this.logger.warn(`Payment failed for Order ID: ${orderId}. Alerting user...`);
      // 1. Update Order Status to 'FAILED'
    }

    // --- PAYPAL LOGIC ---
    if (provider === 'paypal' || provider === 'paypal-capture') {
      // Handle the manual capture object returned directly from API
      if (provider === 'paypal-capture' && event.status === 'COMPLETED') {
        const capture = event.purchase_units[0].payments.captures[0];
        const amount = capture.amount.value;
        const orderId = event.purchase_units[0].reference_id || 'N/A';

        await this.telegramService.sendMessage(
          `✅ <b>PayPal Success! (Manual Capture)</b>\n🛒 Order: ${orderId}\n💵 $${amount}`,
        );
      }

      // Handle async Webhook Event from PayPal
      if (provider === 'paypal' && event.event_type === 'PAYMENT.CAPTURE.COMPLETED') {
        const resource = event.resource;
        const amount = resource.amount.value;
        // In webhooks, custom reference_id might require querying PayPal again or storing it locally first
        await this.telegramService.sendMessage(
          `✅ <b>PayPal Webhook Success!</b>\n🆔 ID: <code>${resource.id}</code>\n💵 $${amount}`,
        );
      }

      if (provider === 'paypal' && event.event_type === 'PAYMENT.CAPTURE.DENIED') {
        await this.telegramService.sendMessage(
          `❌ <b>PayPal Payment Denied</b>\n⚠️ Please check the dashboard.`,
        );
      }
    }
  }
}
