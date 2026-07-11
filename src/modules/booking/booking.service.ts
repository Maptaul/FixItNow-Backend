import httpStatus from "http-status";
import { BookingStatus } from "../../../generated/prisma/client";
import { prisma } from "../../lib/prisma";
import { AppError } from "../../utils/AppError";
import {
  AuthUser,
  CreateBookingPayload,
  UpdateBookingStatusPayload,
} from "./booking.interface";

const bookingInclude = {
  service: { include: { category: true } },
  technician: { include: { user: { select: { id: true, name: true } } } },
  customer: { select: { id: true, name: true, email: true } },
  payment: true,
};

// What a technician is allowed to change a booking to, from each state.
const technicianTransitions: Record<string, BookingStatus[]> = {
  REQUESTED: ["ACCEPTED", "DECLINED"],
  PAID: ["IN_PROGRESS"],
  IN_PROGRESS: ["COMPLETED"],
};

const createBookingIntoDB = async (
  customerId: string,
  payload: CreateBookingPayload,
) => {
  const service = await prisma.service.findUnique({
    where: { id: payload.serviceId },
  });
  if (!service) {
    throw new AppError(httpStatus.NOT_FOUND, "Service not found");
  }

  if (payload.slotId) {
    const slot = await prisma.availabilitySlot.findUnique({
      where: { id: payload.slotId },
    });
    if (!slot || slot.technicianId !== service.technicianId) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        "Invalid slot for this service",
      );
    }
    if (slot.isBooked) {
      throw new AppError(httpStatus.BAD_REQUEST, "Slot is already booked");
    }
  }

  const booking = await prisma.$transaction(async (tx) => {
    const created = await tx.booking.create({
      data: {
        customerId,
        technicianId: service.technicianId,
        serviceId: service.id,
        scheduledAt: new Date(payload.scheduledAt),
        totalAmount: service.price,
        slotId: payload.slotId ?? null,
      },
      include: bookingInclude,
    });
    if (payload.slotId) {
      await tx.availabilitySlot.update({
        where: { id: payload.slotId },
        data: { isBooked: true },
      });
    }
    return created;
  });

  return booking;
};

const getMyBookingsFromDB = async (customerId: string) => {
  return prisma.booking.findMany({
    where: { customerId },
    orderBy: { createdAt: "desc" },
    include: bookingInclude,
  });
};

const getBookingByIdFromDB = async (user: AuthUser, id: string) => {
  const booking = await prisma.booking.findUnique({
    where: { id },
    include: bookingInclude,
  });
  if (!booking) {
    throw new AppError(httpStatus.NOT_FOUND, "Booking not found");
  }

  let allowed = booking.customerId === user.id || user.role === "ADMIN";
  if (!allowed && user.role === "TECHNICIAN") {
    const profile = await prisma.technicianProfile.findUnique({
      where: { userId: user.id },
    });
    allowed = !!profile && profile.id === booking.technicianId;
  }
  if (!allowed) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "You do not have access to this booking",
    );
  }

  return booking;
};

const cancelBookingInDB = async (customerId: string, id: string) => {
  const booking = await prisma.booking.findUnique({ where: { id } });
  if (!booking) {
    throw new AppError(httpStatus.NOT_FOUND, "Booking not found");
  }
  if (booking.customerId !== customerId) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "You can only cancel your own bookings",
    );
  }
  // Cancellable only before the job starts.
  const cancellable: BookingStatus[] = ["REQUESTED", "ACCEPTED", "PAID"];
  if (!cancellable.includes(booking.status)) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      `Cannot cancel a booking that is ${booking.status}`,
    );
  }

  // Free the reserved slot (if any) so it can be booked again.
  return prisma.$transaction(async (tx) => {
    if (booking.slotId) {
      await tx.availabilitySlot.update({
        where: { id: booking.slotId },
        data: { isBooked: false },
      });
    }
    return tx.booking.update({
      where: { id },
      data: { status: "CANCELLED" },
      include: bookingInclude,
    });
  });
};

const getTechnicianBookingsFromDB = async (userId: string) => {
  const profile = await prisma.technicianProfile.findUnique({
    where: { userId },
  });
  if (!profile) {
    throw new AppError(httpStatus.NOT_FOUND, "Technician profile not found");
  }
  return prisma.booking.findMany({
    where: { technicianId: profile.id },
    orderBy: { createdAt: "desc" },
    include: bookingInclude,
  });
};

const updateBookingStatusByTechnician = async (
  userId: string,
  id: string,
  payload: UpdateBookingStatusPayload,
) => {
  const profile = await prisma.technicianProfile.findUnique({
    where: { userId },
  });
  if (!profile) {
    throw new AppError(httpStatus.NOT_FOUND, "Technician profile not found");
  }

  const booking = await prisma.booking.findUnique({ where: { id } });
  if (!booking) {
    throw new AppError(httpStatus.NOT_FOUND, "Booking not found");
  }
  if (booking.technicianId !== profile.id) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "You can only manage bookings assigned to you",
    );
  }

  const allowedNext = technicianTransitions[booking.status] ?? [];
  if (!allowedNext.includes(payload.status)) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      `Invalid status transition from ${booking.status} to ${payload.status}`,
    );
  }

  return prisma.booking.update({
    where: { id },
    data: { status: payload.status },
    include: bookingInclude,
  });
};

export const bookingService = {
  createBookingIntoDB,
  getMyBookingsFromDB,
  getBookingByIdFromDB,
  cancelBookingInDB,
  getTechnicianBookingsFromDB,
  updateBookingStatusByTechnician,
};
