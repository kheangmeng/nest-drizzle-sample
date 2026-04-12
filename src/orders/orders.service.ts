/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Inject, Injectable } from '@nestjs/common';
import { BetterSQLite3Database } from 'drizzle-orm/better-sqlite3';
import { eq } from 'drizzle-orm';
import { InjectQueue } from '@nestjs/bull';
import { type Queue } from 'bull';
import { DRIZZLE } from '../drizzle/drizzle.module';
import * as schema from '../drizzle/schema';
import { OrderItemService } from '../order-items/order-items.service';
import type { CreateOrder } from './orders';
import type { CreateOrderItem } from '../order-items/order-items';
import { ProductService } from 'src/products/products.service';
import { MailService } from '../mail/mail.service';

@Injectable()
export class OrderService {
  constructor(
    @Inject(DRIZZLE) private db: BetterSQLite3Database<typeof schema>,
    private orderItemService: OrderItemService,
    private readonly productService: ProductService,
    private mailService: MailService,
    @InjectQueue('orders-queue') private ordersQueue: Queue,
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
    // find product and set qty
    for (const item of order.items) {
      const product = await this.productService.findById(item.productId);
      if (product) {
        await this.productService.update(item.productId, {
          qty: product.qty - item.qty,
        });
      }
    }

    void this.mailService.sendOrderedEmail('jonhdoe@gmail.com');

    // // Job A: Send order confirmation email
    // await this.ordersQueue.add(
    //   'send-order-confirmation',
    //   { orderId: ordered[0].id, userId: order.userId },
    //   { attempts: 3, backoff: 5000 }, // Retry 3 times if email fails, wait 5s between retries
    // );

    // // Job B: Reserve inventory or alert warehouse
    // await this.ordersQueue.add(
    //   'sync-inventory',
    //   { orderId: ordered[0].id, items: order.items },
    //   { priority: 1 }, // Higher priority
    // );

    return {
      ...ordered[0],
      items: res,
    };
    // });
  }

  async updateCancelledStatus(id: number) {
    await this.db
      .update(schema.orders)
      .set({ status: 'cancelled' })
      .where(eq(schema.orders.id, id));
    // find product and set qty
    const orderItems = await this.orderItemService.findByOrderId(id);
    for (const item of orderItems) {
      const product = await this.productService.findById(item.productId);
      if (product) {
        await this.productService.update(item.productId, {
          qty: product.qty + item.qty,
        });
      }
    }
    // await this.db.delete(schema.orderItems).where(eq(schema.orderItems.orderId, id));

    return {
      message: 'Order cancelled successfully.',
    };
  }

  async updateCompletedStatus(id: number, data: Partial<typeof schema.orders.$inferInsert>) {
    await this.db.update(schema.orders).set(data).where(eq(schema.orders.id, id));
  }

  async update(id: number, data: Partial<typeof schema.orders.$inferInsert>) {
    await this.db.update(schema.orders).set(data).where(eq(schema.orders.id, id));
  }

  async delete(id: number) {
    await this.db.delete(schema.orders).where(eq(schema.orders.id, id));
  }
}
