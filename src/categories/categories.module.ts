import { Module } from '@nestjs/common';
import { CategoryService } from './categories.service';

@Module({
  providers: [CategoryService],
  exports: [CategoryService],
})
export class CategoriesModule {}
