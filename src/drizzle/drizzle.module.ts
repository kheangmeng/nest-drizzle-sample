import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import * as schema from './schema';

// We use a Symbol or a specific string to inject the Drizzle instance
export const DRIZZLE = Symbol('drizzle-connection');

@Global()
@Module({
  providers: [
    {
      provide: DRIZZLE,
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const dbPath = configService.get<string>('DATABASE_URL') || 'sqlite.db';
        // Initialize synchronous SQLite connection
        const sqlite = new Database(dbPath);
        return drizzle(sqlite, { schema });
      },
    },
  ],
  // Export the provider so it can be used in other modules
  exports: [DRIZZLE],
})
export class DrizzleModule {}
