import { z } from 'zod';

export const createPaymentSchema = z
  .object({
    orderId: z.number(),
    status: z.string(),
    amount: z.number(),
  })
  .strict();

export const updatePaymentSchema = z
  .object({
    id: z.number(),
    orderId: z.number(),
    status: z.string(),
    amount: z.number(),
  })
  .strict();
