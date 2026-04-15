/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Inject, Injectable, NotFoundException, Logger } from '@nestjs/common';
import { BetterSQLite3Database } from 'drizzle-orm/better-sqlite3';
import { eq } from 'drizzle-orm';
import { InjectQueue } from '@nestjs/bull';
import { type Queue } from 'bull';
import { DRIZZLE } from '../drizzle/drizzle.module';
import * as schema from '../drizzle/schema';
import type { CreatePayment } from './payments';
import { OrderService } from 'src/orders/orders.service';
import { TelegramService } from '../telegram/telegram.service';
import { StripeService } from '../stripe/stripe.service';

@Injectable()
export class PaymentService {
  private readonly logger = new Logger(PaymentService.name);

  constructor(
    @Inject(DRIZZLE) private db: BetterSQLite3Database<typeof schema>,
    private orderService: OrderService,
    private telegramService: TelegramService,
    private stripeService: StripeService,
    @InjectQueue('payments-queue') private paymentsQueue: Queue,
  ) {}

  async getPayments() {
    return this.db.query.payments.findMany({
      orderBy: (payments, { desc }) => [desc(payments.createdAt)],
    });
  }

  async findById(id: number) {
    const result = await this.db
      .select()
      .from(schema.payments)
      .where(eq(schema.payments.id, id))
      .limit(1);
    return result[0] || null;
  }

  async findByOrderId(orderId: number) {
    const result = await this.db
      .select()
      .from(schema.payments)
      .where(eq(schema.payments.orderId, orderId));
    return result || null;
  }

  async create(payment: CreatePayment) {
    const result = await this.db.insert(schema.payments).values(payment).returning({
      id: schema.payments.id,
      orderId: schema.payments.orderId,
      amount: schema.payments.amount,
      status: schema.payments.status,
      createdAt: schema.payments.createdAt,
    });

    if (result[0].status === 'paid') {
      await this.orderService.update(payment.orderId, { status: 'completed' });

      void this.telegramService.sendMessage(
        `🆕 <b>New Payment Initiated</b>\n\n💰 Amount: ${payment.amount} ${'USD'}\n🆔 ID: <code>${payment.orderId}</code>`,
      );
    }

    // We push the webhook to a queue. This allows our API to return a
    // "200 OK" to Stripe immediately so Stripe doesn't timeout and retry.
    // await this.paymentsQueue.add('process-webhook', result[0], {
    //   attempts: 5, // Important: if our DB is down, we can retry verifying the payment
    //   backoff: {
    //     type: 'exponential', // Retries will wait 1s, 2s, 4s, 8s...
    //     delay: 1000,
    //   },
    // });

    return {
      ...result[0],
    };
  }

  async cancelledPayment(id: number) {
    const payment = await this.findById(id);
    if (!payment) {
      throw new NotFoundException('Payment not found.');
    }
    await this.db
      .update(schema.payments)
      .set({ status: 'cancelled' })
      .where(eq(schema.payments.id, id));

    await this.orderService.updateCancelledStatus(payment.orderId as number);

    return {
      message: 'Payment cancelled successfully.',
    };
  }

  async updatePaidStatus(id: number) {
    const payment = await this.findById(id);
    if (!payment) {
      throw new NotFoundException('Payment not found.');
    }
    await this.db.update(schema.payments).set({ status: 'paid' }).where(eq(schema.payments.id, id));

    await this.orderService.update(payment.orderId as number, { status: 'completed' });

    return {
      message: 'Payment paid successfully.',
    };
  }

  async update(id: number, data: Partial<typeof schema.payments.$inferInsert>) {
    await this.db.update(schema.payments).set(data).where(eq(schema.payments.id, id));
  }

  async delete(id: number) {
    await this.db.delete(schema.payments).where(eq(schema.payments.id, id));
  }

  async initiatePayment(orderId: string, amount: number) {
    this.logger.log(`Initiating payment for Order ${orderId} for amount ${amount}`);

    // In a real app, you would verify the 'amount' against the DB order total here
    // to ensure the user hasn't tampered with the payload.

    return this.stripeService.createPaymentIntent(amount, orderId);
  }

  // Receives the VERIFIED Stripe event
  async handleStripeWebhook(event: any) {
    this.logger.log(`Received verified Stripe webhook event: ${event.type}. Queuing...`);

    // Push to the Bull Queue we created earlier
    // This allows the controller to return a 200 OK to Stripe immediately
    await this.paymentsQueue.add('process-webhook', event, {
      attempts: 5,
      backoff: { type: 'exponential', delay: 1000 },
    });

    return { received: true };
  }
}
