/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Processor, Process, OnQueueActive, OnQueueFailed } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { type Job } from 'bull';
import { MailService } from '../mail/mail.service';

// Connects this class to the 'orders-queue'
@Processor('orders-queue')
export class OrdersProcessor {
  private readonly logger = new Logger(OrdersProcessor.name);

  constructor(private mailService: MailService) {}

  // Consumes jobs named 'send-order-confirmation'
  @Process('send-order-confirmation')
  async handleOrderConfirmation(job: Job<{ orderId: number; userId: number }>) {
    this.logger.log(`Processing confirmation email for Order ID: ${job.data.orderId}`);

    // Simulate fetching user email and sending it via MailService
    await this.mailService.sendOrderedEmail('jonhdoe@gmail.com');

    // Simulate heavy lifting (e.g., generating PDF receipt)
    // await new Promise((resolve) => setTimeout(resolve, 2000));

    this.logger.log(`Email successfully sent for Order ID: ${job.data.orderId}`);
  }

  // Consumes jobs named 'sync-inventory'
  @Process('sync-inventory')
  handleInventorySync(job: Job<{ orderId: number; items: any[] }>) {
    this.logger.log(`Syncing inventory for Order ID: ${job.data.orderId}...`);
    // Logic to loop through items and decrement stock from the Products table
  }

  // --- Queue Event Listeners ---

  @OnQueueActive()
  onActive(job: Job) {
    this.logger.debug(`Starting job ${job.id} of type ${job.name}...`);
  }

  @OnQueueFailed()
  onError(job: Job<any>, error: any) {
    this.logger.error(`Job ${job.id} of type ${job.name} failed! Error: ${error.message}`);
  }
}
