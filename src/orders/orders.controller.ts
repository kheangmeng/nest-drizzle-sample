import {
  Body,
  Controller,
  Post,
  Get,
  UsePipes,
  Logger,
  Patch,
  Delete,
  UseGuards,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiBearerAuth } from '@nestjs/swagger';
import { OrderService } from './orders.service';
import type { CreateOrder, UpdateOrder } from './orders';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import { createOrderSchema, updateOrderSchema } from './orders.schema';
import { CreateOrderDto, UpdateOrderDto, DeleteOrderDto } from './orders.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';

// Note: In production, create proper DTO classes with @nestjs/swagger and class-validator
@ApiTags('orders')
@ApiBearerAuth()
@Controller('orders')
@UseGuards(JwtAuthGuard, RolesGuard)
export class OrderController {
  private readonly logger = new Logger(OrderController.name);

  constructor(private readonly order: OrderService) {}

  @Get()
  @Roles('user', 'admin', 'staff')
  @ApiOperation({ summary: 'Order list' })
  @ApiBody({ type: CreateOrderDto })
  @ApiResponse({ status: 200, description: 'Successfully logged in.' })
  async getAllOrders(@Query() query: { limit?: string; offset?: string }) {
    this.logger.log(`Get orders request`);

    return this.order.getOrders(query);
  }

  @Post()
  @Roles('user', 'admin', 'staff')
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
  @Roles('admin')
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

  @Patch('cancelled')
  @Roles('admin', 'staff')
  @ApiOperation({ summary: 'Cancel order' })
  @ApiResponse({ status: 200, description: 'Order successfully cancelled.' })
  cancelOrder(@Body() body: { id: number }) {
    this.logger.log(`Update order cancelled request for: ${body.id}`);

    return this.order.updateCancelledStatus(body.id);
  }

  @Delete(':id')
  @Roles('admin')
  @ApiOperation({ summary: 'Delete a order' })
  @ApiBody({ type: DeleteOrderDto })
  @ApiResponse({ status: 200, description: 'Order successfully deleted.' })
  @UsePipes(new ZodValidationPipe(updateOrderSchema))
  async deleteOrder(@Body() body: { id: number }) {
    this.logger.log(`Delete order request for: ${body.id}`);

    return this.order.delete(body.id);
  }
}
