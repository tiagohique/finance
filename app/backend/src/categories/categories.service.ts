import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { customAlphabet } from 'nanoid';
import { CategoriesRepository } from './categories.repository';
import { Category } from './category.entity';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

const nanoid = customAlphabet('0123456789abcdefghijklmnopqrstuvwxyz', 10);

@Injectable()
export class CategoriesService {
  constructor(private readonly repository: CategoriesRepository) {}

  async findAll(): Promise<Category[]> {
    const items = await this.repository.findAll();
    return [...items].sort((a, b) => a.name.localeCompare(b.name));
  }

  async findOne(id: string): Promise<Category> {
    const item = await this.repository.findById(id);
    if (!item) {
      throw new NotFoundException('Category not found');
    }
    return item;
  }

  async create(dto: CreateCategoryDto): Promise<Category> {
    const items = await this.repository.findAll();
    this.ensureUniqueName(items, dto.name);
    const category: Category = {
      id: `cat_${nanoid()}`,
      name: dto.name,
      budget: dto.budget ?? 0,
    };
    items.push(category);
    await this.repository.saveAll(items);
    return category;
  }

  async update(id: string, dto: UpdateCategoryDto): Promise<Category> {
    const items = await this.repository.findAll();
    const index = items.findIndex((item) => item.id === id);
    if (index === -1) {
      throw new NotFoundException('Category not found');
    }
    if (dto.name) {
      this.ensureUniqueName(items.filter((item) => item.id !== id), dto.name);
    }
    const next: Category = {
      ...items[index],
      ...dto,
      budget: dto.budget ?? items[index].budget,
    };
    items[index] = next;
    await this.repository.saveAll(items);
    return next;
  }

  async remove(id: string): Promise<void> {
    const items = await this.repository.findAll();
    const filtered = items.filter((item) => item.id !== id);
    if (filtered.length === items.length) {
      throw new NotFoundException('Category not found');
    }
    await this.repository.saveAll(filtered);
  }

  private ensureUniqueName(items: Category[], name: string) {
    const exists = items.some(
      (item) => item.name.toLowerCase() === name.toLowerCase(),
    );
    if (exists) {
      throw new ConflictException('Category name already exists');
    }
  }
}
