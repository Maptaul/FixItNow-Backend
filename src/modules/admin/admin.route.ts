import { Router } from "express";
import { Role } from "../../../generated/prisma/client";
import { auth } from "../../middlewares/auth";
import { validateRequest } from "../../middlewares/validateRequest";
import { adminController } from "./admin.controller";
import { adminValidation } from "./admin.validation";

const router = Router();

router.get("/users", auth(Role.ADMIN), adminController.getAllUsers);
router.patch(
  "/users/:id",
  auth(Role.ADMIN),
  validateRequest(adminValidation.updateUserStatusSchema),
  adminController.updateUserStatus,
);
router.get("/bookings", auth(Role.ADMIN), adminController.getAllBookings);

export const adminRoutes = router;
