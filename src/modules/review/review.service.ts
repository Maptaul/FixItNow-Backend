import httpStatus from "http-status";
import { prisma } from "../../lib/prisma";
import { AppError } from "../../utils/AppError";
import { CreateReviewPayload } from "./review.interface";

const createReviewIntoDB = async (
  customerId: string,
  payload: CreateReviewPayload,
) => {
  const booking = await prisma.booking.findUnique({
    where: { id: payload.bookingId },
    include: { review: true },
  });
  if (!booking) {
    throw new AppError(httpStatus.NOT_FOUND, "Booking not found");
  }
  if (booking.customerId !== customerId) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "You can only review your own bookings",
    );
  }
  if (booking.status !== "COMPLETED") {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "You can only review a completed booking",
    );
  }
  if (booking.review) {
    throw new AppError(
      httpStatus.CONFLICT,
      "This booking has already been reviewed",
    );
  }

  // Create the review, then refresh the technician's average rating.
  const review = await prisma.$transaction(async (tx) => {
    const created = await tx.review.create({
      data: {
        bookingId: booking.id,
        rating: payload.rating,
        comment: payload.comment,
      },
    });

    const agg = await tx.review.aggregate({
      where: { booking: { technicianId: booking.technicianId } },
      _avg: { rating: true },
    });

    await tx.technicianProfile.update({
      where: { id: booking.technicianId },
      data: { avgRating: agg._avg.rating ?? 0 },
    });

    return created;
  });

  return review;
};

export const reviewService = {
  createReviewIntoDB,
};
