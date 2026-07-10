export interface CreateServicePayload {
  categoryId: string;
  title: string;
  description?: string;
  price: number;
}

export interface UpdateServicePayload {
  categoryId?: string;
  title?: string;
  description?: string;
  price?: number;
}

export interface ServiceFilters {
  categoryId?: string;
  location?: string;
  minPrice?: string;
  maxPrice?: string;
  minRating?: string;
  search?: string;
  page?: string;
  limit?: string;
}
