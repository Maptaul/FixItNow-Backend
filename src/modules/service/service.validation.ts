import { z } from "zod";

const createSchema = z.object({
  categoryId: z.string().min(1, "categoryId is required"),
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().optional(),
  price: z.number().positive("Price must be a positive number"),
});

const updateSchema = z
  .object({
    categoryId: z.string().min(1).optional(),
    title: z.string().min(3, "Title must be at least 3 characters").optional(),
    description: z.string().optional(),
    price: z.number().positive("Price must be a positive number").optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field is required to update",
  });

export const serviceValidation = {
  createSchema,
  updateSchema,
};
