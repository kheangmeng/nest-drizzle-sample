export class CreateProductDto {
  name!: string;
  description!: string;
  price!: number;
  qty!: number;
  image!: string;
  categoryId!: number;
}

export class UpdateProductDto {
  id!: number;
  name!: string;
  description!: string;
  price!: number;
  qty!: number;
  image!: string;
  categoryId!: number;
}

export class DeleteProductDto {
  id!: number;
}

export class GetProductDto {
  id!: number;
}
