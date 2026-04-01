import { defineConfig } from 'drizzle-kit';
import * as dotenv from 'dotenv';

// Load .env file for Drizzle Kit CLI operations
dotenv.config();

export default defineConfig({
  schema: './src/drizzle/schema.ts',
  out: './drizzle',
  dialect: 'sqlite',
  dbCredentials: {
    url: process.env.DATABASE_URL || 'sqlite.db',
  },
  verbose: true,
  strict: true,
});
