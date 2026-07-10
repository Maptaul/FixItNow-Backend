import { Router } from "express";
import { Role } from "../../../generated/prisma/client";
import { auth } from "../../middlewares/auth";
import { validateRequest } from "../../middlewares/validateRequest";
import { technicianController } from "./technician.controller";
import { technicianValidation } from "./technician.validation";

// Public — /api/technicians
const technicianRouter = Router();
technicianRouter.get("/", technicianController.getAllTechnicians);
technicianRouter.get("/:id", technicianController.getTechnicianById);

// Technician self-service — /api/technician
const technicianSelfRouter = Router();
technicianSelfRouter.put(
  "/profile",
  auth(Role.TECHNICIAN),
  validateRequest(technicianValidation.updateProfileSchema),
  technicianController.updateProfile,
);
technicianSelfRouter.put(
  "/availability",
  auth(Role.TECHNICIAN),
  validateRequest(technicianValidation.availabilitySchema),
  technicianController.setAvailability,
);

export const technicianRoutes = {
  technicianRouter,
  technicianSelfRouter,
};
