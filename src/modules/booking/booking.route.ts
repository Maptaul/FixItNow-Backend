import { Router } from "express";
import { Role } from "../../../generated/prisma/client";
import { auth } from "../../middlewares/auth";
import { validateRequest } from "../../middlewares/validateRequest";
import { bookingController } from "./booking.controller";
import { bookingValidation } from "./booking.validation";

// Customer — /api/bookings
const customerRouter = Router();
customerRouter.post(
  "/",
  auth(Role.CUSTOMER),
  validateRequest(bookingValidation.createSchema),
  bookingController.createBooking,
);
customerRouter.get("/", auth(Role.CUSTOMER), bookingController.getMyBookings);
customerRouter.get(
  "/:id",
  auth(Role.CUSTOMER, Role.TECHNICIAN, Role.ADMIN),
  bookingController.getBookingById,
);
customerRouter.patch(
  "/:id/cancel",
  auth(Role.CUSTOMER),
  bookingController.cancelBooking,
);

// Technician — /api/technician/bookings
const technicianRouter = Router();
technicianRouter.get(
  "/",
  auth(Role.TECHNICIAN),
  bookingController.getTechnicianBookings,
);
technicianRouter.patch(
  "/:id",
  auth(Role.TECHNICIAN),
  validateRequest(bookingValidation.updateStatusSchema),
  bookingController.updateBookingStatus,
);

export const bookingRoutes = { customerRouter, technicianRouter };
