export interface CreateReviewPayload {
  bookingId: string;
  rating: number;
  comment?: string;
}
