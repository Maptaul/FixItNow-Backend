import { z } from "zod";

const createSchema = z.object({
  bookingId: z.string().min(1, "bookingId is required"),
});

const confirmSchema = z.object({
  sessionId: z.string().min(1, "sessionId is required"),
});

export const paymentValidation = {
  createSchema,
  confirmSchema,
};
