import { Inject, Injectable } from '@nestjs/common';
import { BetterSQLite3Database } from 'drizzle-orm/better-sqlite3';
import { DRIZZLE } from './drizzle/drizzle.module';
import * as schema from './drizzle/schema';
import type { CreateUserDto } from './users/users.dto';

@Injectable()
export class AppService {
  constructor(
    // Inject the Drizzle instance using our custom token
    @Inject(DRIZZLE) private db: BetterSQLite3Database<typeof schema>,
  ) {}
  async getUsers() {
    // Using Drizzle's Relational Queries API
    return this.db.query.users.findMany({
      orderBy: (users, { desc }) => [desc(users.createdAt)],
    });
  }

  async createUser({ name, email, password }: CreateUserDto) {
    // Standard insert with returning values
    const result = await this.db
      .insert(schema.users)
      .values({ name, email, password })
      .returning();

    return result[0];
  }

  getHello(): string {
    return 'Hello World!';
  }
}
