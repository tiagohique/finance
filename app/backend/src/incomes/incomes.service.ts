import { Injectable, NotFoundException } from '@nestjs/common';
import { customAlphabet } from 'nanoid';
import { IncomesRepository } from './incomes.repository';
import { IncomeQueryDto } from './dto/income-query.dto';
import { CreateIncomeDto } from './dto/create-income.dto';
import { UpdateIncomeDto } from './dto/update-income.dto';
import { Income } from './income.entity';
import { isWithinRange } from '../common/utils/date.utils';

const nanoid = customAlphabet('0123456789abcdefghijklmnopqrstuvwxyz', 10);

@Injectable()
export class IncomesService {
  constructor(private readonly repository: IncomesRepository) {}

  async findAll(userId: string, query: IncomeQueryDto): Promise<Income[]> {
    const items = await this.repository.findAll();
    return items
      .filter((item) => item.userId === userId)
      .filter((item) => {
        if (!isWithinRange(item.date, query.from, query.to)) {
          return false;
        }
        if (query.categoryId && item.categoryId !== query.categoryId) {
          return false;
        }
        return true;
      })
      .sort((a, b) => b.date.localeCompare(a.date));
  }

  async create(userId: string, dto: CreateIncomeDto): Promise<Income> {
    const items = await this.repository.findAll();
    const income: Income = {
      id: `inc_${nanoid()}`,
      userId,
      ...dto,
    };
    items.push(income);
    await this.repository.saveAll(items);
    return income;
  }

  async update(userId: string, id: string, dto: UpdateIncomeDto): Promise<Income> {
    const items = await this.repository.findAll();
    const index = items.findIndex(
      (item) => item.id === id && item.userId === userId,
    );
    if (index === -1) {
      throw new NotFoundException('Income not found');
    }
    const next: Income = { ...items[index], ...dto, id, userId };
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
      throw new NotFoundException('Income not found');
    }
    await this.repository.saveAll(filtered);
  }
}
