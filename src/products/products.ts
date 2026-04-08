export interface CreateProduct {
  name: string;
  description?: string;
  price: number;
  qty: number;
  image?: string;
  categoryId: number;
}

export interface UpdateProduct {
  id: number;
  name: string;
  description?: string;
  price: number;
  qty: number;
  image?: string;
  categoryId: number;
}

export interface DeleteProduct {
  id: number;
}

export interface GetProduct {
  id: number;
}
