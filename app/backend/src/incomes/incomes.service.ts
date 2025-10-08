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

  async findAll(query: IncomeQueryDto): Promise<Income[]> {
    const items = await this.repository.findAll();
    return items
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

  async create(dto: CreateIncomeDto): Promise<Income> {
    const items = await this.repository.findAll();
    const income: Income = {
      id: `inc_${nanoid()}`,
      ...dto,
    };
    items.push(income);
    await this.repository.saveAll(items);
    return income;
  }

  async update(id: string, dto: UpdateIncomeDto): Promise<Income> {
    const items = await this.repository.findAll();
    const index = items.findIndex((item) => item.id === id);
    if (index === -1) {
      throw new NotFoundException('Income not found');
    }
    const next: Income = { ...items[index], ...dto, id };
    items[index] = next;
    await this.repository.saveAll(items);
    return next;
  }

  async remove(id: string): Promise<void> {
    const items = await this.repository.findAll();
    const filtered = items.filter((item) => item.id !== id);
    if (filtered.length === items.length) {
      throw new NotFoundException('Income not found');
    }
    await this.repository.saveAll(filtered);
  }
}
