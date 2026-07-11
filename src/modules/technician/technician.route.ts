import { Router } from "express";
import { Role } from "../../../generated/prisma/client";
import { auth } from "../../middlewares/auth";
import { validateRequest } from "../../middlewares/validateRequest";
import { technicianController } from "./technician.controller";
import { technicianValidation } from "./technician.validation";

// Public — /api/technicians
const publicRouter = Router();
publicRouter.get("/", technicianController.getAllTechnicians);
publicRouter.get("/:id", technicianController.getTechnicianById);

// Technician self-service — /api/technician
const selfRouter = Router();
selfRouter.put(
  "/profile",
  auth(Role.TECHNICIAN),
  validateRequest(technicianValidation.updateProfileSchema),
  technicianController.updateProfile,
);
selfRouter.put(
  "/availability",
  auth(Role.TECHNICIAN),
  validateRequest(technicianValidation.availabilitySchema),
  technicianController.setAvailability,
);

export const technicianRoutes = { publicRouter, selfRouter };
