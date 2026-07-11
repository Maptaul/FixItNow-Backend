import { Router } from "express";
import { Role } from "../../../generated/prisma/client";
import { auth } from "../../middlewares/auth";
import { validateRequest } from "../../middlewares/validateRequest";
import { serviceController } from "./service.controller";
import { serviceValidation } from "./service.validation";

// Public — GET /api/services
const publicRouter = Router();
publicRouter.get("/", serviceController.getAllServices);

// Technician — /api/technician/services (manage own services)
const technicianRouter = Router();
technicianRouter.post(
  "/",
  auth(Role.TECHNICIAN),
  validateRequest(serviceValidation.createSchema),
  serviceController.createService,
);
technicianRouter.put(
  "/:id",
  auth(Role.TECHNICIAN),
  validateRequest(serviceValidation.updateSchema),
  serviceController.updateService,
);
technicianRouter.delete(
  "/:id",
  auth(Role.TECHNICIAN),
  serviceController.deleteService,
);

export const serviceRoutes = { publicRouter, technicianRouter };
