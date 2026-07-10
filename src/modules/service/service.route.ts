import { Router } from "express";
import { Role } from "../../../generated/prisma/client";
import { auth } from "../../middlewares/auth";
import { validateRequest } from "../../middlewares/validateRequest";
import { serviceController } from "./service.controller";
import { serviceValidation } from "./service.validation";

const serviceRouter = Router();
serviceRouter.get("/", serviceController.getAllServices);

const technicianServiceRouter = Router();
technicianServiceRouter.post(
  "/",
  auth(Role.TECHNICIAN),
  validateRequest(serviceValidation.createSchema),
  serviceController.createService,
);
technicianServiceRouter.put(
  "/:id",
  auth(Role.TECHNICIAN),
  validateRequest(serviceValidation.updateSchema),
  serviceController.updateService,
);
technicianServiceRouter.delete(
  "/:id",
  auth(Role.TECHNICIAN),
  serviceController.deleteService,
);

export const serviceRoutes = {
  serviceRouter,
  technicianServiceRouter,
};
