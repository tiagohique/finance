import { Injectable } from '@nestjs/common';
import { IncomesRepository } from '../incomes/incomes.repository';
import { ExpensesRepository } from '../expenses/expenses.repository';
import { CategoriesRepository } from '../categories/categories.repository';
import { SalariesRepository } from '../salaries/salaries.repository';
import { YearMonthDto } from '../common/dto/year-month.dto';
import {
  daysInMonth,
  endOfMonthIso,
  occursInMonth,
  parseIsoDate,
  startOfMonthIso,
} from '../common/utils/date.utils';
import { Expense } from '../expenses/expense.entity';
import { Category } from '../categories/category.entity';
import { Income } from '../incomes/income.entity';
import { Salary } from '../salaries/salary.entity';

interface CategorySummary {
  categoryId: string;
  total: number;
  budget: number;
  percent: number;
}

export interface SummaryResponse {
  incomeTotal: number;
  expenseTotal: number;
  balance: number;
  byCategory: CategorySummary[];
}

interface ExpenseForPeriod extends Expense {
  effectiveDate: string;
}

@Injectable()
export class ReportsService {
  constructor(
    private readonly incomesRepository: IncomesRepository,
    private readonly expensesRepository: ExpensesRepository,
    private readonly categoriesRepository: CategoriesRepository,
    private readonly salariesRepository: SalariesRepository,
  ) {}

  async getSummary(
    userId: string,
    { year, month }: YearMonthDto,
  ): Promise<SummaryResponse> {
    const period = { year, month };
    const [incomes, expenses, categories, salaryAmount] = await Promise.all([
      this.getIncomesForMonth(userId, period),
      this.getExpensesForMonth(userId, period),
      this.getCategories(userId),
      this.getSalaryAmount(userId, period),
    ]);

    const extraIncomeTotal = incomes.reduce(
      (acc, income) => acc + income.amount,
      0,
    );
    const expenseTotal = expenses.reduce(
      (acc, expense) => acc + expense.amount,
      0,
    );

    const byCategory = this.buildCategorySummary(expenses, categories);

    return {
      incomeTotal: salaryAmount + extraIncomeTotal,
      expenseTotal,
      balance: salaryAmount + extraIncomeTotal - expenseTotal,
      byCategory,
    };
  }

  async exportCsv(
    userId: string,
    { year, month }: YearMonthDto,
  ): Promise<string> {
    const period = { year, month };
    const [incomes, expenses, categories, salary] = await Promise.all([
      this.getIncomesForMonth(userId, period),
      this.getExpensesForMonth(userId, period),
      this.getCategories(userId),
      this.getSalary(userId, period),
    ]);

    const categoriesMap = new Map(
      categories.map((category) => [category.id, category.name]),
    );

    const rows: Array<Array<string | number>> = [];
    rows.push(['type', 'date', 'description', 'category', 'paymentMethod', 'amount']);

    if (salary) {
      rows.push([
        'salary',
        this.resolveSalaryDate(period),
        'Salario Mensal',
        '',
        '',
        salary.amount.toFixed(2),
      ]);
    }

    incomes.forEach((income) => {
      rows.push([
        'income',
        income.date,
        income.description,
        categoriesMap.get(income.categoryId) ?? income.categoryId,
        '',
        income.amount.toFixed(2),
      ]);
    });

    expenses.forEach((expense) => {
      rows.push([
        'expense',
        expense.effectiveDate,
        expense.description,
        categoriesMap.get(expense.categoryId) ?? expense.categoryId,
        expense.paymentMethod,
        expense.amount.toFixed(2),
      ]);
    });

    return rows.map((columns) => columns.map(this.escapeCsv).join(',')).join('\n');
  }

  private async getSalaryAmount(
    userId: string,
    period: { year: number; month: number },
  ) {
    const salary = await this.getSalary(userId, period);
    return salary?.amount ?? 0;
  }

  private async getSalary(
    userId: string,
    period: { year: number; month: number },
  ): Promise<Salary | undefined> {
    const items = await this.salariesRepository.findAll();
    return items.find(
      (item) =>
        item.userId === userId &&
        item.year === period.year &&
        item.month === period.month,
    );
  }

  private async getIncomesForMonth(
    userId: string,
    period: { year: number; month: number },
  ): Promise<Income[]> {
    const start = startOfMonthIso(period);
    const end = endOfMonthIso(period);
    const items = await this.incomesRepository.findAll();
    return items
      .filter((income) => income.userId === userId)
      .filter((income) => income.date >= start && income.date <= end)
      .sort((a, b) => a.date.localeCompare(b.date));
  }

  private async getExpensesForMonth(
    userId: string,
    period: { year: number; month: number },
  ): Promise<ExpenseForPeriod[]> {
    const items = await this.expensesRepository.findAll();
    const totalDays = daysInMonth(period);

    return items
      .filter((expense) => expense.userId === userId)
      .filter((expense) => occursInMonth(expense.date, period, expense.isRecurring))
      .map((expense) => {
        const date = parseIsoDate(expense.date);
        const sameMonth =
          date.getFullYear() === period.year &&
          date.getMonth() + 1 === period.month;
        if (sameMonth || !expense.isRecurring) {
          return { ...expense, effectiveDate: expense.date };
        }
        const day = Math.min(date.getDate(), totalDays)
          .toString()
          .padStart(2, '0');
        const effectiveDate = `${period.year}-${period.month
          .toString()
          .padStart(2, '0')}-${day}`;
        return { ...expense, effectiveDate };
      })
      .sort((a, b) => a.effectiveDate.localeCompare(b.effectiveDate));
  }

  private async getCategories(userId: string): Promise<Category[]> {
    const items = await this.categoriesRepository.findAll();
    return items.filter((item) => item.userId === userId);
  }

  private buildCategorySummary(
    expenses: ExpenseForPeriod[],
    categories: Category[],
  ): CategorySummary[] {
    const totals = new Map<string, number>();
    expenses.forEach((expense) => {
      const current = totals.get(expense.categoryId) ?? 0;
      totals.set(expense.categoryId, current + expense.amount);
    });

    return categories.map((category) => {
      const total = Number((totals.get(category.id) ?? 0).toFixed(2));
      const percent =
        category.budget && category.budget > 0
          ? Number(((total / category.budget) * 100).toFixed(2))
          : 0;
      return {
        categoryId: category.id,
        total,
        budget: category.budget,
        percent,
      };
    });
  }

  private resolveSalaryDate(period: { year: number; month: number }) {
    return startOfMonthIso(period);
  }

  private escapeCsv(value: string | number) {
    const raw = typeof value === 'number' ? value.toString() : value;
    if (raw.includes(',') || raw.includes('"') || raw.includes('\n')) {
      return `"${raw.replace(/"/g, '""')}"`;
    }
    return raw;
  }
}
