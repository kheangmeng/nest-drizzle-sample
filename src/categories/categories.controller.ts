import { Body, Controller, Post, Get, UsePipes, Logger, Patch, Delete } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { CategoryService } from './categories.service';
import type { CreateCategory, UpdateCategory } from './categories';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import { createCategorySchema, updateCategorySchema } from './categories.schema';
import { CreateCategoryDto, UpdateCategoryDto, DeleteCategoryDto } from './categories.dto';

// Note: In production, create proper DTO classes with @nestjs/swagger and class-validator
@ApiTags('categories')
@Controller('categories')
export class CategoryController {
  private readonly logger = new Logger(CategoryController.name);

  constructor(private readonly category: CategoryService) {}

  @Get()
  @ApiOperation({ summary: 'Category list' })
  @ApiBody({ type: CreateCategoryDto })
  @ApiResponse({ status: 200, description: 'Successfully logged in.' })
  async getAllCategories() {
    this.logger.log(`Get categories request`);

    return this.category.getCategories();
  }

  @Post()
  @ApiOperation({ summary: 'Create a new category' })
  @ApiBody({ type: CreateCategoryDto })
  @ApiResponse({ status: 201, description: 'Category successfully created.' })
  @ApiResponse({ status: 400, description: 'Validation failed.' })
  @ApiResponse({ status: 409, description: 'Email already in use.' })
  @UsePipes(new ZodValidationPipe(createCategorySchema))
  async createCategory(@Body() body: CreateCategory) {
    const category = {
      name: body.name,
      description: body.description,
    };
    this.logger.log(`Create category request for: ${body.name}`);

    return this.category.create(category);
  }

  @Patch()
  @ApiOperation({ summary: 'Update a category' })
  @ApiBody({ type: UpdateCategoryDto })
  @ApiResponse({ status: 200, description: 'Category successfully updated.' })
  @UsePipes(new ZodValidationPipe(updateCategorySchema))
  async updateCategory(@Body() body: UpdateCategory) {
    const category = {
      name: body.name,
      description: body.description,
    };
    this.logger.log(`Update category request for: ${body.name}`);

    return this.category.update(body.id, category);
  }

  @Delete()
  @ApiOperation({ summary: 'Delete a category' })
  @ApiBody({ type: DeleteCategoryDto })
  @ApiResponse({ status: 200, description: 'Category successfully deleted.' })
  @UsePipes(new ZodValidationPipe(updateCategorySchema))
  async deleteCategory(@Body() body: { id: number }) {
    this.logger.log(`Delete category request for: ${body.id}`);

    return this.category.delete(body.id);
  }
}
