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

  async findAll(userId: string, query: ExpenseQueryDto): Promise<Expense[]> {
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
        if (query.recurring !== undefined && item.isRecurring !== query.recurring) {
          return false;
        }
        return true;
      })
      .sort((a, b) => b.date.localeCompare(a.date));
  }

  async create(userId: string, dto: CreateExpenseDto): Promise<Expense> {
    const items = await this.repository.findAll();
    const expense: Expense = {
      id: `exp_${nanoid()}`,
      userId,
      ...dto,
    };
    items.push(expense);
    await this.repository.saveAll(items);
    return expense;
  }

  async update(
    userId: string,
    id: string,
    dto: UpdateExpenseDto,
  ): Promise<Expense> {
    const items = await this.repository.findAll();
    const index = items.findIndex(
      (item) => item.id === id && item.userId === userId,
    );
    if (index === -1) {
      throw new NotFoundException('Expense not found');
    }
    const next: Expense = { ...items[index], ...dto, id, userId };
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
      throw new NotFoundException('Expense not found');
    }
    await this.repository.saveAll(filtered);
  }
}
