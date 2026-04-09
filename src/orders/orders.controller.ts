import { Body, Controller, Post, Get, UsePipes, Logger, Patch, Delete } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { OrderService } from './orders.service';
import type { CreateOrder, UpdateOrder } from './orders';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import { createOrderSchema, updateOrderSchema } from './orders.schema';
import { CreateOrderDto, UpdateOrderDto, DeleteOrderDto } from './orders.dto';

// Note: In production, create proper DTO classes with @nestjs/swagger and class-validator
@ApiTags('orders')
@Controller('orders')
export class OrderController {
  private readonly logger = new Logger(OrderController.name);

  constructor(private readonly order: OrderService) {}

  @Get()
  @ApiOperation({ summary: 'Order list' })
  @ApiBody({ type: CreateOrderDto })
  @ApiResponse({ status: 200, description: 'Successfully logged in.' })
  async getAllOrders() {
    this.logger.log(`Get orders request`);

    return this.order.getOrders();
  }

  @Post()
  @ApiOperation({ summary: 'Create a new order' })
  @ApiBody({ type: CreateOrderDto })
  @ApiResponse({ status: 201, description: 'Order successfully created.' })
  @ApiResponse({ status: 400, description: 'Validation failed.' })
  @ApiResponse({ status: 409, description: 'Email already in use.' })
  @UsePipes(new ZodValidationPipe(createOrderSchema))
  async createOrder(@Body() body: CreateOrder) {
    const order = {
      userId: body.userId,
      status: body.status,
      createdAt: body.createdAt,
      updatedAt: body.updatedAt,
      items: body.items,
    };
    this.logger.log(`Create order request for: ${body.userId}`);

    return this.order.create(order);
  }

  @Patch()
  @ApiOperation({ summary: 'Update a order' })
  @ApiBody({ type: UpdateOrderDto })
  @ApiResponse({ status: 200, description: 'Order successfully updated.' })
  @UsePipes(new ZodValidationPipe(updateOrderSchema))
  async updateOrder(@Body() body: UpdateOrder) {
    const order = {
      id: body.id,
      userId: body.userId,
      status: body.status,
      createdAt: body.createdAt,
      updatedAt: body.updatedAt,
    };
    this.logger.log(`Update order request for: ${body.id}`);

    return this.order.update(body.id, order);
  }

  @Delete()
  @ApiOperation({ summary: 'Delete a order' })
  @ApiBody({ type: DeleteOrderDto })
  @ApiResponse({ status: 200, description: 'Order successfully deleted.' })
  @UsePipes(new ZodValidationPipe(updateOrderSchema))
  async deleteOrder(@Body() body: { id: number }) {
    this.logger.log(`Delete order request for: ${body.id}`);

    return this.order.delete(body.id);
  }
}
