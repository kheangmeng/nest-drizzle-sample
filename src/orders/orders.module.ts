import { Module } from '@nestjs/common';
import { OrderService } from './orders.service';
import { OrderItemsModule } from '../order-items/order-items.module';
import { ProductsModule } from 'src/products/products.module';

@Module({
  providers: [OrderService],
  exports: [OrderService],
  imports: [OrderItemsModule, ProductsModule],
})
export class OrdersModule {}
