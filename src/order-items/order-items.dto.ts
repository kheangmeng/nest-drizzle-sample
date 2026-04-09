export class CreateOrderDto {
  userId!: number;
  status!: string;
  createdAt!: Date;
  updatedAt!: Date;
}

export class UpdateOrderDto {
  id!: number;
  userId!: number;
  status!: string;
  createdAt!: Date;
  updatedAt!: Date;
}

export class DeleteOrderDto {
  id!: number;
}

export class GetOrderDto {
  id!: number;
}
