import { z } from "zod";

const createSchema = z.object({
  name: z.string().min(2, "Category name must be at least 2 characters"),
  icon: z.string().optional(),
});

const updateSchema = z
  .object({
    name: z
      .string()
      .min(2, "Category name must be at least 2 characters")
      .optional(),
    icon: z.string().optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field is required to update",
  });

export const categoryValidation = {
  createSchema,
  updateSchema,
};
