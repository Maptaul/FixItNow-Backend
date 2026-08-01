import { z } from "zod";

const createSchema = z.object({
  bookingId: z.string().min(1, "bookingId is required"),
  /**
   * Where Stripe should send the customer back to. Optional, and only
   * honoured when it matches APP_ORIGINS — see `resolveReturnOrigin`.
   */
  origin: z.url("origin must be a valid URL").optional(),
});

const confirmSchema = z.object({
  sessionId: z.string().min(1, "sessionId is required"),
});

export const paymentValidation = {
  createSchema,
  confirmSchema,
};
