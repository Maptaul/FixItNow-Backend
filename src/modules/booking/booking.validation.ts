import { z } from "zod";

const createSchema = z.object({
  serviceId: z.string().min(1, "serviceId is required"),
  scheduledAt: z
    .string()
    .refine(
      (d) => !Number.isNaN(Date.parse(d)) && new Date(d) > new Date(),
      "scheduledAt must be a valid future date",
    ),
  slotId: z.string().optional(),
});

// A technician may only move a booking to these states.
const updateStatusSchema = z.object({
  status: z.enum(["ACCEPTED", "DECLINED", "IN_PROGRESS", "COMPLETED"]),
});

export const bookingValidation = {
  createSchema,
  updateStatusSchema,
};
