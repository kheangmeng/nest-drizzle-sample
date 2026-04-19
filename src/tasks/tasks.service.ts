import { Inject, Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { BetterSQLite3Database } from 'drizzle-orm/better-sqlite3';
import { lt, and, eq } from 'drizzle-orm';
import { DRIZZLE } from '../drizzle/drizzle.module';
import * as schema from '../drizzle/schema';

@Injectable()
export class TasksService {
  private readonly logger = new Logger(TasksService.name);

  constructor(@Inject(DRIZZLE) private db: BetterSQLite3Database<typeof schema>) {}

  /**
   * Example 1: Nightly Database Cleanup
   * Runs exactly at midnight every day.
   * Clears out password reset tokens that have expired to keep the DB clean.
   */
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async handleExpiredTokensCleanup() {
    this.logger.log('CRON: Starting cleanup of expired password reset tokens...');

    try {
      await this.db
        .update(schema.users)
        .set({
          resetToken: null,
          resetTokenExpiresAt: null,
        })
        .where(lt(schema.users.resetTokenExpiresAt, new Date())); // Less than current time

      this.logger.log('CRON: Successfully cleaned up expired tokens.');
    } catch (error) {
      this.logger.error('CRON: Failed to clean up expired tokens', error);
    }
  }

  /**
   * Example 2: Hourly Order Maintenance
   * Runs at the 0th minute of every hour (e.g., 1:00, 2:00, 3:00).
   * Finds unpaid orders older than 24 hours and marks them as CANCELED.
   */
  @Cron(CronExpression.EVERY_HOUR)
  async cancelUnpaidOrders() {
    console.log('CRON 1H');
    this.logger.log('CRON: Checking for expired unpaid orders...');

    // Calculate the time 24 hours ago
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    try {
      // Assuming your schema.orders has a 'status' and 'createdAt' field
      await this.db
        .update(schema.orders)
        .set({ status: 'cancelled' })
        .where(
          and(eq(schema.orders.status, 'pending'), lt(schema.orders.createdAt, twentyFourHoursAgo)),
        );
      this.logger.log('CRON: Unpaid orders cleanup completed.');
    } catch (error) {
      this.logger.error('CRON: Failed to cancel unpaid orders', error);
    }
  }

  /**
   * Example 3: Custom Interval (For Testing)
   * Runs every 30 seconds. Good for making sure your cron setup is working.
   * Uncomment the decorator below to test it!
   */
  // @Cron('*/30 * * * * *')
  // handleCronTest() {
  //   console.log('CRON 30sec');
  //   this.logger.debug('CRON: This message fires every 30 seconds.');
  // }
}
