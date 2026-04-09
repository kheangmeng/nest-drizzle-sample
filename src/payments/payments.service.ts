/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Inject, Injectable } from '@nestjs/common';
import { BetterSQLite3Database } from 'drizzle-orm/better-sqlite3';
import { eq } from 'drizzle-orm';
import { DRIZZLE } from '../drizzle/drizzle.module';
import * as schema from '../drizzle/schema';
import type { CreatePayment } from './payments';

@Injectable()
export class PaymentService {
  constructor(@Inject(DRIZZLE) private db: BetterSQLite3Database<typeof schema>) {}

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

  async create(payment: CreatePayment) {
    const paid = await this.db.insert(schema.payments).values(payment).returning({
      id: schema.payments.id,
      orderId: schema.payments.orderId,
      amount: schema.payments.amount,
      status: schema.payments.status,
      createdAt: schema.payments.createdAt,
    });

    return {
      ...paid[0],
    };
  }

  async update(id: number, data: Partial<typeof schema.payments.$inferInsert>) {
    await this.db.update(schema.payments).set(data).where(eq(schema.payments.id, id));
  }

  async delete(id: number) {
    await this.db.delete(schema.payments).where(eq(schema.payments.id, id));
  }
}
