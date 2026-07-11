import { z } from "zod";

const createSchema = z.object({
  bookingId: z.string().min(1, "bookingId is required"),
  rating: z
    .number()
    .int("Rating must be an integer")
    .min(1, "Rating must be between 1 and 5")
    .max(5, "Rating must be between 1 and 5"),
  comment: z.string().optional(),
});

export const reviewValidation = {
  createSchema,
};
