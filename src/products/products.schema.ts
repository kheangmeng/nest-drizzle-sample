import { z } from 'zod';

export const createProductSchema = z
  .object({
    name: z.string().min(3, { message: 'Name must be at least 3 characters long' }).max(255),
    description: z.string().optional(),
    price: z.number(),
    qty: z.number(),
    image: z.string().optional(),
    categoryId: z.number(),
  })
  .strict();

export const updateProductSchema = z
  .object({
    id: z.number(),
    name: z.string().min(3, { message: 'Name must be at least 3 characters long' }).max(255),
    description: z.string().optional(),
    price: z.number(),
    qty: z.number(),
    image: z.string().optional(),
    categoryId: z.number(),
  })
  .strict();
