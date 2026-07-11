import { Request, Response } from "express";
import httpStatus from "http-status";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { AuthUser } from "./booking.interface";
import { bookingService } from "./booking.service";

const createBooking = catchAsync(async (req: Request, res: Response) => {
  const booking = await bookingService.createBookingIntoDB(
    req.user?.id as string,
    req.body,
  );

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.CREATED,
    message: "Booking created successfully",
    data: booking,
  });
});

const getMyBookings = catchAsync(async (req: Request, res: Response) => {
  const bookings = await bookingService.getMyBookingsFromDB(
    req.user?.id as string,
  );

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Bookings fetched successfully",
    data: bookings,
  });
});

const getBookingById = catchAsync(async (req: Request, res: Response) => {
  const booking = await bookingService.getBookingByIdFromDB(
    req.user as AuthUser,
    req.params.id as string,
  );

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Booking fetched successfully",
    data: booking,
  });
});

const cancelBooking = catchAsync(async (req: Request, res: Response) => {
  const booking = await bookingService.cancelBookingInDB(
    req.user?.id as string,
    req.params.id as string,
  );

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Booking cancelled successfully",
    data: booking,
  });
});

const getTechnicianBookings = catchAsync(async (req: Request, res: Response) => {
  const bookings = await bookingService.getTechnicianBookingsFromDB(
    req.user?.id as string,
  );

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Technician bookings fetched successfully",
    data: bookings,
  });
});

const updateBookingStatus = catchAsync(async (req: Request, res: Response) => {
  const booking = await bookingService.updateBookingStatusByTechnician(
    req.user?.id as string,
    req.params.id as string,
    req.body,
  );

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Booking status updated successfully",
    data: booking,
  });
});

export const bookingController = {
  createBooking,
  getMyBookings,
  getBookingById,
  cancelBooking,
  getTechnicianBookings,
  updateBookingStatus,
};
