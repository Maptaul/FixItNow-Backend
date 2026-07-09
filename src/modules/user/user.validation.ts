import { z } from "zod";

const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  // Users may only register as CUSTOMER or TECHNICIAN, never ADMIN.
  role: z.enum(["CUSTOMER", "TECHNICIAN"]).optional(),
});

const updateProfileSchema = z
  .object({
    name: z.string().min(2, "Name must be at least 2 characters").optional(),
    password: z
      .string()
      .min(6, "Password must be at least 6 characters")
      .optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field is required to update",
  });

export const userValidation = {
  registerSchema,
  updateProfileSchema,
};
