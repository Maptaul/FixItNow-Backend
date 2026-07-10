export interface UpdateTechnicianProfilePayload {
  bio?: string;
  experienceYears?: number;
  hourlyRate?: number;
  location?: string;
}

export interface AvailabilitySlotInput {
  date: string; // "2026-08-01"
  startTime: string; // "09:00"
  endTime: string; // "11:00"
}

export interface SetAvailabilityPayload {
  slots: AvailabilitySlotInput[];
}

export interface TechnicianFilters {
  location?: string;
  minRating?: string;
  categoryId?: string;
  page?: string;
  limit?: string;
}
