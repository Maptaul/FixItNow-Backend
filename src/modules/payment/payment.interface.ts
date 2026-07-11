export interface CreatePaymentPayload {
  bookingId: string;
}

export interface ConfirmPaymentPayload {
  sessionId: string;
}

export interface AuthUser {
  id: string;
  role: "CUSTOMER" | "TECHNICIAN" | "ADMIN";
}
