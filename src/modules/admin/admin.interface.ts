export interface UserFilters {
  role?: string;
  status?: string;
}

export interface UpdateUserStatusPayload {
  activeStatus: "ACTIVE" | "BLOCKED";
}
