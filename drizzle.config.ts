import { defineConfig } from 'drizzle-kit';
import * as dotenv from 'dotenv';

// Load .env file for Drizzle Kit CLI operations
dotenv.config();

export default defineConfig({
  schema: './src/drizzle/schema.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL || '',
  },
  verbose: true,
  strict: true,
});
