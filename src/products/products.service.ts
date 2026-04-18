import { Inject, Injectable } from '@nestjs/common';
import { BetterSQLite3Database } from 'drizzle-orm/better-sqlite3';
import { eq } from 'drizzle-orm';
import { DRIZZLE } from '../drizzle/drizzle.module';
import * as schema from '../drizzle/schema';

@Injectable()
export class ProductService {
  constructor(@Inject(DRIZZLE) private db: BetterSQLite3Database<typeof schema>) {}

  async getProducts(req: { limit?: string; offset?: string }) {
    const { limit, offset } = req || { limit: 10, offset: 0 };

    return this.db.query.products.findMany({
      limit: Number(limit),
      offset: Number(offset),
      orderBy: (products, { desc }) => [desc(products.createdAt)],
    });
  }

  async findById(id: number, db?: BetterSQLite3Database<typeof schema>) {
    const dbToUse = db || this.db;
    const result = await dbToUse
      .select()
      .from(schema.products)
      .where(eq(schema.products.id, id))
      .limit(1);
    return result[0] || null;
  }

  async create(product: typeof schema.products.$inferInsert) {
    const result = await this.db.insert(schema.products).values(product).returning({
      name: schema.products.name,
      description: schema.products.description,
      price: schema.products.price,
      qty: schema.products.qty,
      image: schema.products.image,
      categoryId: schema.products.categoryId,
      createdAt: schema.products.createdAt,
    });

    return result[0];
  }

  async update(
    id: number,
    data: Partial<typeof schema.products.$inferInsert>,
    db?: BetterSQLite3Database<typeof schema>,
  ) {
    const dbToUse = db || this.db;
    await dbToUse.update(schema.products).set(data).where(eq(schema.products.id, id));

    return {
      message: 'Product updated successfully.',
    };
  }

  async delete(id: number) {
    await this.db.delete(schema.products).where(eq(schema.products.id, id));
  }
}
