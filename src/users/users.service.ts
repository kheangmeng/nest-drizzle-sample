import { Inject, Injectable } from '@nestjs/common';
import { BetterSQLite3Database } from 'drizzle-orm/better-sqlite3';
import { eq } from 'drizzle-orm';
import { DRIZZLE } from '../drizzle/drizzle.module';
import * as schema from '../drizzle/schema';

@Injectable()
export class UsersService {
  constructor(@Inject(DRIZZLE) private db: BetterSQLite3Database<typeof schema>) {}

  async findByEmail(email: string) {
    const result = await this.db
      .select()
      .from(schema.users)
      .where(eq(schema.users.email, email))
      .limit(1);

    return result[0] || null;
  }

  async create(user: typeof schema.users.$inferInsert) {
    const result = await this.db.insert(schema.users).values(user).returning({
      email: schema.users.email,
      name: schema.users.name,
      password: schema.users.password,
      createdAt: schema.users.createdAt,
    });

    return result[0];
  }
}
