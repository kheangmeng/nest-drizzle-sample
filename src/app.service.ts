import { Inject, Injectable } from '@nestjs/common';
import { BetterSQLite3Database } from 'drizzle-orm/better-sqlite3';
import { DRIZZLE } from './drizzle/drizzle.module';
import * as schema from './drizzle/schema';

@Injectable()
export class AppService {
  constructor(
    // Inject the Drizzle instance using our custom token
    @Inject(DRIZZLE) private db: BetterSQLite3Database<typeof schema>,
  ) {}

  getHello(): string {
    return 'Hello World!';
  }
}
