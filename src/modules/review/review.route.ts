import { Router } from "express";
import { Role } from "../../../generated/prisma/client";
import { auth } from "../../middlewares/auth";
import { validateRequest } from "../../middlewares/validateRequest";
import { reviewController } from "./review.controller";
import { reviewValidation } from "./review.validation";

const router = Router();

router.post(
  "/",
  auth(Role.CUSTOMER),
  validateRequest(reviewValidation.createSchema),
  reviewController.createReview,
);

export const reviewRoutes = router;
