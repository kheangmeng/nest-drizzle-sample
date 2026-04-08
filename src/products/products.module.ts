import { Module } from '@nestjs/common';
import { ProductService } from './products.service';

@Module({
  providers: [ProductService],
  exports: [ProductService],
})
export class ProductsModule {}
