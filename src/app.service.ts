import { Inject, Injectable } from '@nestjs/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { DRIZZLE } from './drizzle/drizzle.module';
import * as schema from './drizzle/schema';

@Injectable()
export class AppService {
  constructor(
    // Inject the Drizzle instance using our custom token
    @Inject(DRIZZLE) private db: NodePgDatabase<typeof schema>,
  ) {}
  async getUsers() {
    // Using Drizzle's Relational Queries API
    return this.db.query.users.findMany({
      orderBy: (users, { desc }) => [desc(users.createdAt)],
    });
  }

  async createUser(name: string, email: string) {
    // Standard insert with returning values
    const result = await this.db
      .insert(schema.users)
      .values({ name, email })
      .returning();
    return result[0];
  }
  getHello(): string {
    return 'Hello World!';
  }
}
