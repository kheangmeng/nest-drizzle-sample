import { Module } from '@nestjs/common';
import { OrderService } from './orders.service';
import { OrderItemsModule } from '../order-items/order-items.module';

@Module({
  providers: [OrderService],
  exports: [OrderService],
  imports: [OrderItemsModule],
})
export class OrdersModule {}
