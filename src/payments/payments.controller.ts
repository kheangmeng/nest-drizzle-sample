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
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiBearerAuth } from '@nestjs/swagger';
import { PaymentService } from './payments.service';
import type { CreatePayment, UpdatePayment } from './payments';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import { createPaymentSchema, updatePaymentSchema } from './payments.schema';
import { CreatePaymentDto, UpdatePaymentDto, DeletePaymentDto } from './payments.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';

// Note: In production, create proper DTO classes with @nestjs/swagger and class-validator
@ApiTags('payments')
@ApiBearerAuth()
@Controller('payments')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PaymentController {
  private readonly logger = new Logger(PaymentController.name);

  constructor(private readonly payment: PaymentService) {}

  @Get()
  @Roles('admin', 'staff')
  @ApiOperation({ summary: 'Payment list' })
  @ApiBody({ type: CreatePaymentDto })
  @ApiResponse({ status: 200, description: 'Successfully logged in.' })
  async getAllPayments() {
    this.logger.log(`Get payments request`);

    return this.payment.getPayments();
  }

  @Post()
  @Roles('admin', 'staff')
  @ApiOperation({ summary: 'Create a new payment' })
  @ApiBody({ type: CreatePaymentDto })
  @ApiResponse({ status: 201, description: 'Payment successfully created.' })
  @ApiResponse({ status: 400, description: 'Validation failed.' })
  @ApiResponse({ status: 409, description: 'Email already in use.' })
  @UsePipes(new ZodValidationPipe(createPaymentSchema))
  async createPayment(@Body() body: CreatePayment) {
    const payment = {
      orderId: body.orderId,
      status: body.status,
      amount: body.amount,
      createdAt: body.createdAt,
      updatedAt: body.updatedAt,
    };
    this.logger.log(`Create payment request for: ${body.orderId}`);

    return this.payment.create(payment);
  }

  @Patch()
  @Roles('admin')
  @ApiOperation({ summary: 'Update a payment' })
  @ApiBody({ type: UpdatePaymentDto })
  @ApiResponse({ status: 200, description: 'Payment successfully updated.' })
  @UsePipes(new ZodValidationPipe(updatePaymentSchema))
  async updatePayment(@Body() body: UpdatePayment) {
    const payment = {
      id: body.id,
      orderId: body.orderId,
      amount: body.amount,
      status: body.status,
      createdAt: body.createdAt,
      updatedAt: body.updatedAt,
    };
    this.logger.log(`Update payment request for: ${body.id}`);

    return this.payment.update(body.id, payment);
  }

  @Patch('cancelled')
  @Roles('admin', 'staff')
  @ApiOperation({ summary: 'Cancel payment' })
  @ApiResponse({ status: 200, description: 'Payment successfully cancelled.' })
  cancelPayment(@Body() body: { id: number }) {
    this.logger.log(`Update payment cancelled request for: ${body.id}`);

    return this.payment.cancelledPayment(body.id);
  }

  @Patch('paid')
  @Roles('admin', 'staff')
  @ApiOperation({ summary: 'Pay payment' })
  @ApiResponse({ status: 200, description: 'Payment successfully paid.' })
  payPayment(@Body() body: { id: number }) {
    this.logger.log(`Update payment paid request for: ${body.id}`);

    return this.payment.updatePaidStatus(body.id);
  }

  @Delete()
  @Roles('admin')
  @ApiOperation({ summary: 'Delete a payment' })
  @ApiBody({ type: DeletePaymentDto })
  @ApiResponse({ status: 200, description: 'Payment successfully deleted.' })
  @UsePipes(new ZodValidationPipe(updatePaymentSchema))
  async deletePayment(@Body() body: { id: number }) {
    this.logger.log(`Delete payment request for: ${body.id}`);

    return this.payment.delete(body.id);
  }
}
