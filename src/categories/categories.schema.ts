import { z } from 'zod';

export const createCategorySchema = z
  .object({
    name: z.string().min(3, { message: 'Name must be at least 3 characters long' }).max(255),
    description: z.string().optional(),
  })
  .strict();

export const updateCategorySchema = z
  .object({
    name: z.string().min(3, { message: 'Name must be at least 3 characters long' }).max(255),
    description: z.string().optional(),
  })
  .strict();

export const deleteCategorySchema = z
  .object({
    id: z.number(),
  })
  .strict();

export const getCategorySchema = z
  .object({
    id: z.number(),
  })
  .strict();
