import { Module } from '@nestjs/common';
import { OrderItemService } from './order-items.service';

@Module({
  providers: [OrderItemService],
  exports: [OrderItemService],
})
export class OrderItemsModule {}
