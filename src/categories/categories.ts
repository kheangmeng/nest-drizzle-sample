export interface CreateCategory {
  name: string;
  description?: string;
}

export interface UpdateCategory {
  id: number;
  name: string;
  description?: string;
}
