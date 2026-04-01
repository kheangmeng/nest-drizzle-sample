import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
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
        // Retrieve the database URL from the environment via ConfigService
        const databaseUrl = configService.get<string>('DATABASE_URL');
        // Initialize the pg connection pool
        const pool = new Pool({
          connectionString: databaseUrl,
        });

        // Pass the connection pool and the schema to Drizzle
        return drizzle(pool, { schema });
      },
    },
  ],
  // Export the provider so it can be used in other modules
  exports: [DRIZZLE],
})
export class DrizzleModule {}
