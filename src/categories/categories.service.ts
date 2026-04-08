import { Inject, Injectable } from '@nestjs/common';
import { BetterSQLite3Database } from 'drizzle-orm/better-sqlite3';
import { eq } from 'drizzle-orm';
import { DRIZZLE } from '../drizzle/drizzle.module';
import * as schema from '../drizzle/schema';

@Injectable()
export class CategoryService {
  constructor(@Inject(DRIZZLE) private db: BetterSQLite3Database<typeof schema>) {}

  async getCategories() {
    return this.db.query.categories.findMany({
      orderBy: (categories, { desc }) => [desc(categories.createdAt)],
    });
  }

  async findById(id: number) {
    const result = await this.db
      .select()
      .from(schema.categories)
      .where(eq(schema.categories.id, id))
      .limit(1);
    return result[0] || null;
  }

  async create(category: typeof schema.categories.$inferInsert) {
    const result = await this.db.insert(schema.categories).values(category).returning({
      name: schema.categories.name,
      description: schema.categories.description,
      createdAt: schema.categories.createdAt,
    });

    return result[0];
  }

  async update(id: number, data: Partial<typeof schema.categories.$inferInsert>) {
    await this.db.update(schema.categories).set(data).where(eq(schema.categories.id, id));
  }

  async delete(id: number) {
    await this.db.delete(schema.categories).where(eq(schema.categories.id, id));
  }
}
