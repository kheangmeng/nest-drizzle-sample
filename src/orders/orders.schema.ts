import { z } from 'zod';

export const createOrderSchema = z
  .object({
    userId: z.number(),
    status: z.string(),
    items: z.array(
      z.object({
        productId: z.number(),
        qty: z.number(),
      }),
    ),
  })
  .strict();

export const updateOrderSchema = z
  .object({
    id: z.number(),
    userId: z.number(),
    status: z.string(),
  })
  .strict();
