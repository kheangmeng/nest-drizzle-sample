import { Inject, Injectable } from '@nestjs/common';
import { BetterSQLite3Database } from 'drizzle-orm/better-sqlite3';
import { eq } from 'drizzle-orm';
import { DRIZZLE } from '../drizzle/drizzle.module';
import * as schema from '../drizzle/schema';

@Injectable()
export class OrderItemService {
  constructor(@Inject(DRIZZLE) private db: BetterSQLite3Database<typeof schema>) {}

  async getOrderItems() {
    return this.db.query.orderItems.findMany({
      orderBy: (orderItems, { desc }) => [desc(orderItems.createdAt)],
    });
  }

  async findById(id: number) {
    const result = await this.db
      .select()
      .from(schema.orderItems)
      .where(eq(schema.orderItems.id, id))
      .limit(1);
    return result[0] || null;
  }

  create(orders: (typeof schema.orderItems.$inferInsert)[]) {
    return this.db.insert(schema.orderItems).values(orders).returning({
      id: schema.orderItems.id,
      orderId: schema.orderItems.orderId,
      productId: schema.orderItems.productId,
      qty: schema.orderItems.qty,
      createdAt: schema.orderItems.createdAt,
      updatedAt: schema.orderItems.updatedAt,
    });
  }

  async update(id: number, data: Partial<typeof schema.orderItems.$inferInsert>) {
    await this.db.update(schema.orderItems).set(data).where(eq(schema.orderItems.id, id));
  }

  async delete(id: number) {
    await this.db.delete(schema.orderItems).where(eq(schema.orderItems.id, id));
  }
}
