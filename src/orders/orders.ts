import type { CreateOrderItem } from '../order-items/order-items';

export type OrderStatus = 'pending' | 'completed' | 'cancelled';

export interface CreateOrder {
  userId: number;
  status: OrderStatus;
  items: CreateOrderItem[];
  createdAt: Date;
  updatedAt: Date;
}

export interface UpdateOrder {
  id: number;
  userId: number;
  status: OrderStatus;
  items: CreateOrderItem[];
  createdAt: Date;
  updatedAt: Date;
}

export interface DeleteOrder {
  id: number;
}

export interface GetOrder {
  id: number;
}
