export class CreatePaymentDto {
  orderId!: number;
  status!: string;
  amount!: number;
  createdAt!: Date;
  updatedAt!: Date;
}

export class UpdatePaymentDto {
  id!: number;
  orderId!: number;
  status!: string;
  amount!: number;
  createdAt!: Date;
  updatedAt!: Date;
}

export class DeletePaymentDto {
  id!: number;
}

export class GetPaymentDto {
  id!: number;
}

export class CapturePaypalDto {
  paypalOrderId!: string;
}
