export interface RegisterUserPayload {
  name: string;
  email: string;
  password: string;
  role?: "CUSTOMER" | "TECHNICIAN";
}

export interface UpdateProfilePayload {
  name?: string;
  password?: string;
}
