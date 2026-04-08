export class CreateCategoryDto {
  name!: string;
  description!: string;
}

export class UpdateCategoryDto {
  id!: number;
  name!: string;
  description!: string;
}

export class DeleteCategoryDto {
  id!: number;
}

export class GetCategoryDto {
  id!: number;
}
