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

export const updateProductSchema = z.object({
  id: z.number().optional(),
  name: z
    .string()
    .min(3, { message: 'Name must be at least 3 characters long' })
    .max(255)
    .optional(),
  description: z.string().optional(),
  price: z.number().optional(),
  qty: z.number().optional(),
  image: z.string().optional(),
  categoryId: z.number().optional(),
});
