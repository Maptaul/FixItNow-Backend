import { z } from "zod";

const time = /^([01]\d|2[0-3]):[0-5]\d$/; // HH:mm 24h

const updateProfileSchema = z
  .object({
    bio: z.string().optional(),
    experienceYears: z
      .number()
      .int()
      .min(0, "Experience cannot be negative")
      .optional(),
    hourlyRate: z.number().min(0, "Hourly rate cannot be negative").optional(),
    location: z.string().min(1).optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field is required to update",
  });

const availabilitySchema = z.object({
  slots: z
    .array(
      z
        .object({
          date: z
            .string()
            .refine((d) => !Number.isNaN(Date.parse(d)), "Invalid date"),
          startTime: z.string().regex(time, "startTime must be HH:mm"),
          endTime: z.string().regex(time, "endTime must be HH:mm"),
        })
        .refine((s) => s.endTime > s.startTime, {
          message: "endTime must be after startTime",
          path: ["endTime"],
        }),
    )
    .min(1, "At least one slot is required"),
});

export const technicianValidation = {
  updateProfileSchema,
  availabilitySchema,
};
