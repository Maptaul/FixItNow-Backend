export interface RegisterUserPayload {
  name: string;
  email: string;
  password: string;
  role?: "CUSTOMER" | "TECHNICIAN";
}

export interface UpdateProfilePayload {
  name?: string;
  password?: string;
  /** Empty string clears the picture; `undefined` leaves it alone. */
  avatarUrl?: string | null;
}
