import { Router } from "express";
import { Role } from "../../../generated/prisma/client";
import { auth } from "../../middlewares/auth";
import { validateRequest } from "../../middlewares/validateRequest";
import { paymentController } from "./payment.controller";
import { paymentValidation } from "./payment.validation";

const router = Router();

// Stripe webhook — no auth; raw body is applied in app.ts before express.json.
router.post("/webhook", paymentController.handleWebhook);

router.post(
  "/create",
  auth(Role.CUSTOMER),
  validateRequest(paymentValidation.createSchema),
  paymentController.createPayment,
);
router.post(
  "/confirm",
  auth(Role.CUSTOMER),
  validateRequest(paymentValidation.confirmSchema),
  paymentController.confirmPayment,
);
router.get(
  "/",
  auth(Role.CUSTOMER, Role.ADMIN),
  paymentController.getMyPayments,
);
router.get(
  "/:id",
  auth(Role.CUSTOMER, Role.ADMIN),
  paymentController.getPaymentById,
);

export const paymentRoutes = router;
