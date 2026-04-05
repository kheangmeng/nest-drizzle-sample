import { z } from 'zod';

export const loginSchema = z.object({
  email: z
    .email({ message: 'Invalid email format' })
    .min(5, { message: 'Email is too short' })
    .max(255),
  password: z.string().min(1, { message: 'Password is required' }),
});

export const createUserSchema = z
  .object({
    name: z.string().min(3, { message: 'Name must be at least 3 characters long' }).max(255),
    email: z
      .email({ message: 'Invalid email format' })
      .min(5, { message: 'Email is too short' })
      .max(255),
    password: z
      .string()
      .min(8, { message: 'Password must be at least 8 characters long' })
      .regex(/[A-Z]/, { message: 'Password must contain at least one uppercase letter' })
      .regex(/[0-9]/, { message: 'Password must contain at least one number' }),
  })
  .strict(); // .strict() prevents extra unknown fields from being submitted

// Extract the TypeScript type from the schema
export type CreateUser = z.infer<typeof createUserSchema>;
