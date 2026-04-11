import {
  Body,
  Controller,
  Post,
  Get,
  UsePipes,
  Logger,
  Patch,
  Delete,
  Param,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiBearerAuth } from '@nestjs/swagger';
import { ProductService } from './products.service';
import type { CreateProduct, UpdateProduct } from './products';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import { createProductSchema, updateProductSchema } from './products.schema';
import { CreateProductDto, UpdateProductDto, DeleteProductDto } from './products.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';

// Note: In production, create proper DTO classes with @nestjs/swagger and class-validator
@ApiTags('products')
@ApiBearerAuth()
@Controller('products')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ProductController {
  private readonly logger = new Logger(ProductController.name);

  constructor(private readonly product: ProductService) {}

  @Get()
  @Roles('admin', 'staff')
  @ApiOperation({ summary: 'Product list' })
  @ApiBody({ type: CreateProductDto })
  @ApiResponse({ status: 200, description: 'Successfully logged in.' })
  async getAllProducts() {
    this.logger.log(`Get products request`);

    return this.product.getProducts();
  }

  @Post()
  @Roles('admin', 'staff')
  @ApiOperation({ summary: 'Create a new product' })
  @ApiBody({ type: CreateProductDto })
  @ApiResponse({ status: 201, description: 'Product successfully created.' })
  @ApiResponse({ status: 400, description: 'Validation failed.' })
  @ApiResponse({ status: 409, description: 'Email already in use.' })
  @UsePipes(new ZodValidationPipe(createProductSchema))
  async createProduct(@Body() body: CreateProduct) {
    const product = {
      name: body.name,
      description: body.description,
      price: body.price,
      qty: body.qty,
      image: body.image,
      categoryId: body.categoryId,
    };
    this.logger.log(`Create product request for: ${body.name}`);

    return this.product.create(product);
  }

  @Patch(':id')
  @Roles('admin', 'staff')
  @ApiOperation({ summary: 'Update a product' })
  @ApiBody({ type: UpdateProductDto })
  @ApiResponse({ status: 200, description: 'Product successfully updated.' })
  // @UsePipes(new ZodValidationPipe(updateProductSchema))
  async updateProduct(@Param('id') id: string, @Body() body: UpdateProduct) {
    const product = {
      name: body.name,
      description: body.description,
      price: body.price,
      qty: body.qty,
      image: body.image,
      categoryId: body.categoryId,
    };
    this.logger.log(`Update product request for: ${body.name}`);

    return this.product.update(Number(id), product);
  }

  @Delete()
  @Roles('admin')
  @ApiOperation({ summary: 'Delete a product' })
  @ApiBody({ type: DeleteProductDto })
  @ApiResponse({ status: 200, description: 'Product successfully deleted.' })
  @UsePipes(new ZodValidationPipe(updateProductSchema))
  async deleteProduct(@Body() body: { id: number }) {
    this.logger.log(`Delete product request for: ${body.id}`);

    return this.product.delete(body.id);
  }
}
