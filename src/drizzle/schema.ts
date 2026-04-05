import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

// SQLite specific table definition
export const users = sqliteTable('users', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  email: text('email').notNull().unique(),
  name: text('name').notNull().unique(),
  password: text('password').notNull(),
  refreshToken: text('refresh_token'),
  resetToken: text('reset_token'),
  resetTokenExpiresAt: integer('reset_token_expires_at', { mode: 'timestamp' }),
  // Using mode: 'timestamp' automatically converts SQLite integers to JS Date objects
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
});
