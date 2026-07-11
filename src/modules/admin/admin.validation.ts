import { z } from "zod";

const updateUserStatusSchema = z.object({
  activeStatus: z.enum(["ACTIVE", "BLOCKED"]),
});

export const adminValidation = {
  updateUserStatusSchema,
};
