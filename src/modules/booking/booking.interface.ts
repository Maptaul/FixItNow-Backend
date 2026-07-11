import { BookingStatus } from "../../../generated/prisma/client";

export interface CreateBookingPayload {
  serviceId: string;
  scheduledAt: string;
  slotId?: string;
}

export interface UpdateBookingStatusPayload {
  status: Extract<
    BookingStatus,
    "ACCEPTED" | "DECLINED" | "IN_PROGRESS" | "COMPLETED"
  >;
}

export interface AuthUser {
  id: string;
  role: "CUSTOMER" | "TECHNICIAN" | "ADMIN";
}
