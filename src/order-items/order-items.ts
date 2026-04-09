export interface CreateOrderItem {
  orderId: number;
  productId: number;
  qty: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface UpdateOrderItem {
  id: number;
  orderId: number;
  productId: number;
  qty: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface DeleteOrderItem {
  id: number;
}

export interface GetOrderItem {
  id: number;
}
