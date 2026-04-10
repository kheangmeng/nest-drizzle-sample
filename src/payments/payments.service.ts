/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { BetterSQLite3Database } from 'drizzle-orm/better-sqlite3';
import { eq } from 'drizzle-orm';
import { DRIZZLE } from '../drizzle/drizzle.module';
import * as schema from '../drizzle/schema';
import type { CreatePayment } from './payments';
import { OrderService } from 'src/orders/orders.service';

@Injectable()
export class PaymentService {
  constructor(
    @Inject(DRIZZLE) private db: BetterSQLite3Database<typeof schema>,
    private orderService: OrderService,
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
    }

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
}
