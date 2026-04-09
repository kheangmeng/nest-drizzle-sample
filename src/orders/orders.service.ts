/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Inject, Injectable } from '@nestjs/common';
import { BetterSQLite3Database } from 'drizzle-orm/better-sqlite3';
import { eq } from 'drizzle-orm';
import { DRIZZLE } from '../drizzle/drizzle.module';
import * as schema from '../drizzle/schema';
import { OrderItemService } from '../order-items/order-items.service';
import type { CreateOrder } from './orders';
import type { CreateOrderItem } from '../order-items/order-items';

@Injectable()
export class OrderService {
  constructor(
    @Inject(DRIZZLE) private db: BetterSQLite3Database<typeof schema>,
    private orderItemService: OrderItemService,
  ) {}

  async getOrders() {
    return this.db.query.orders.findMany({
      orderBy: (orders, { desc }) => [desc(orders.createdAt)],
    });
  }

  async findById(id: number) {
    const result = await this.db
      .select()
      .from(schema.orders)
      .where(eq(schema.orders.id, id))
      .limit(1);
    return result[0] || null;
  }

  async create(order: CreateOrder) {
    // const result = await this.db.transaction(async (tx) => {
    const ordered = await this.db.insert(schema.orders).values(order).returning({
      id: schema.orders.id,
      userId: schema.orders.userId,
      status: schema.orders.status,
      createdAt: schema.orders.createdAt,
    });

    const orderItems: CreateOrderItem[] = [];
    for (const item of order.items) {
      orderItems.push({
        orderId: ordered[0].id,
        productId: item.productId,
        qty: item.qty,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }
    const res = await this.orderItemService.create(orderItems);

    return {
      ...ordered[0],
      items: res,
    };
    // });
  }

  async update(id: number, data: Partial<typeof schema.orders.$inferInsert>) {
    await this.db.update(schema.orders).set(data).where(eq(schema.orders.id, id));
  }

  async delete(id: number) {
    await this.db.delete(schema.orders).where(eq(schema.orders.id, id));
  }
}
