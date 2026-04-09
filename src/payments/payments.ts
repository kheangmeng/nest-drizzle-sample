export type PaymentStatus = 'pending' | 'paid' | 'cancelled';

export interface CreatePayment {
  orderId: number;
  status: PaymentStatus;
  amount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface UpdatePayment {
  id: number;
  orderId: number;
  status: PaymentStatus;
  amount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface DeletePayment {
  id: number;
}

export interface GetPayment {
  id: number;
}
