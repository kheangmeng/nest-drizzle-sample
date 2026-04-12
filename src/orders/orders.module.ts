import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { OrderService } from './orders.service';
import { OrderController } from './orders.controller';
import { OrdersProcessor } from './orders.processor';
import { OrderItemsModule } from '../order-items/order-items.module';
import { ProductsModule } from 'src/products/products.module';
import { MailModule } from '../mail/mail.module';

@Module({
  providers: [OrderService, OrdersProcessor],
  exports: [OrderService],
  imports: [
    OrderItemsModule,
    ProductsModule,
    MailModule,
    BullModule.registerQueue({
      name: 'orders-queue',
    }),
  ],
  controllers: [OrderController],
})
export class OrdersModule {}
