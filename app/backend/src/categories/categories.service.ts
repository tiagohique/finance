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

  async findAll(userId: string): Promise<Category[]> {
    const items = await this.repository.findAll();
    return items
      .filter((item) => item.userId === userId)
      .sort((a, b) => a.name.localeCompare(b.name));
  }

  async findOne(userId: string, id: string): Promise<Category> {
    const items = await this.repository.findAll();
    const item = items.find(
      (category) => category.id === id && category.userId === userId,
    );
    if (!item) {
      throw new NotFoundException('Category not found');
    }
    return item;
  }

  async create(userId: string, dto: CreateCategoryDto): Promise<Category> {
    const items = await this.repository.findAll();
    const scoped = items.filter((item) => item.userId === userId);
    this.ensureUniqueName(scoped, dto.name);
    const category: Category = {
      id: `cat_${nanoid()}`,
      userId,
      name: dto.name,
      budget: dto.budget ?? 0,
    };
    items.push(category);
    await this.repository.saveAll(items);
    return category;
  }

  async update(
    userId: string,
    id: string,
    dto: UpdateCategoryDto,
  ): Promise<Category> {
    const items = await this.repository.findAll();
    const index = items.findIndex(
      (item) => item.id === id && item.userId === userId,
    );
    if (index === -1) {
      throw new NotFoundException('Category not found');
    }
    if (dto.name) {
      this.ensureUniqueName(
        items.filter(
          (item) => item.userId === userId && item.id !== id,
        ),
        dto.name,
      );
    }
    const next: Category = {
      ...items[index],
      userId,
      ...dto,
      budget: dto.budget ?? items[index].budget,
    };
    items[index] = next;
    await this.repository.saveAll(items);
    return next;
  }

  async remove(userId: string, id: string): Promise<void> {
    const items = await this.repository.findAll();
    const filtered = items.filter(
      (item) => !(item.id === id && item.userId === userId),
    );
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
