import { Injectable, NotFoundException } from '@nestjs/common';
import { customAlphabet } from 'nanoid';
import { ExpensesRepository } from './expenses.repository';
import { ExpenseQueryDto } from './dto/expense-query.dto';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { UpdateExpenseDto } from './dto/update-expense.dto';
import { Expense } from './expense.entity';
import { isWithinRange } from '../common/utils/date.utils';

const nanoid = customAlphabet('0123456789abcdefghijklmnopqrstuvwxyz', 10);

@Injectable()
export class ExpensesService {
  constructor(private readonly repository: ExpensesRepository) {}

  async findAll(query: ExpenseQueryDto): Promise<Expense[]> {
    const items = await this.repository.findAll();
    return items
      .filter((item) => {
        if (!isWithinRange(item.date, query.from, query.to)) {
          return false;
        }
        if (query.categoryId && item.categoryId !== query.categoryId) {
          return false;
        }
        if (query.recurring !== undefined && item.isRecurring !== query.recurring) {
          return false;
        }
        return true;
      })
      .sort((a, b) => b.date.localeCompare(a.date));
  }

  async create(dto: CreateExpenseDto): Promise<Expense> {
    const items = await this.repository.findAll();
    const expense: Expense = {
      id: `exp_${nanoid()}`,
      ...dto,
    };
    items.push(expense);
    await this.repository.saveAll(items);
    return expense;
  }

  async update(id: string, dto: UpdateExpenseDto): Promise<Expense> {
    const items = await this.repository.findAll();
    const index = items.findIndex((item) => item.id === id);
    if (index === -1) {
      throw new NotFoundException('Expense not found');
    }
    const next: Expense = { ...items[index], ...dto, id };
    items[index] = next;
    await this.repository.saveAll(items);
    return next;
  }

  async remove(id: string): Promise<void> {
    const items = await this.repository.findAll();
    const filtered = items.filter((item) => item.id !== id);
    if (filtered.length === items.length) {
      throw new NotFoundException('Expense not found');
    }
    await this.repository.saveAll(filtered);
  }
}
