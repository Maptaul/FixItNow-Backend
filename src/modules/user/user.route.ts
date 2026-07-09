import { Router } from "express";
import { Role } from "../../../generated/prisma/client";
import { auth } from "../../middlewares/auth";
import { validateRequest } from "../../middlewares/validateRequest";
import { userController } from "./user.controller";
import { userValidation } from "./user.validation";

const router = Router();

router.post(
  "/register",
  validateRequest(userValidation.registerSchema),
  userController.registerUser,
);

router.get(
  "/me",
  auth(Role.CUSTOMER, Role.TECHNICIAN, Role.ADMIN),
  userController.getMyProfile,
);

router.put(
  "/my-profile",
  auth(Role.CUSTOMER, Role.TECHNICIAN, Role.ADMIN),
  validateRequest(userValidation.updateProfileSchema),
  userController.updateMyProfile,
);

export const userRouter = router;
