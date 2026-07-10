export interface CreateCategoryPayload {
  name: string;
  icon?: string;
}

export interface UpdateCategoryPayload {
  name?: string;
  icon?: string;
}
