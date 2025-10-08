import { ReportsService } from '../src/reports/reports.service';
import { Income } from '../src/incomes/income.entity';
import { Expense, PaymentMethod } from '../src/expenses/expense.entity';
import { Category } from '../src/categories/category.entity';
import { Salary } from '../src/salaries/salary.entity';

const createService = (deps?: {
  incomes?: Income[];
  expenses?: Expense[];
  categories?: Category[];
  salaries?: Salary[];
}) => {
  const incomesRepository = {
    findAll: jest.fn().mockResolvedValue(deps?.incomes ?? []),
  } as any;
  const expensesRepository = {
    findAll: jest.fn().mockResolvedValue(deps?.expenses ?? []),
  } as any;
  const categoriesRepository = {
    findAll: jest.fn().mockResolvedValue(deps?.categories ?? []),
  } as any;
  const salariesRepository = {
    findAll: jest.fn().mockResolvedValue(deps?.salaries ?? []),
  } as any;

  return new ReportsService(
    incomesRepository,
    expensesRepository,
    categoriesRepository,
    salariesRepository,
  );
};

describe('ReportsService', () => {
  it('calculates summary including salary, recurring expenses and budgets', async () => {
    const service = createService({
      incomes: [
        {
          id: 'inc-1',
          date: '2025-10-10',
          description: 'Freela',
          categoryId: 'cat_extra',
          amount: 400,
        },
      ],
      expenses: [
        {
          id: 'exp-1',
          date: '2025-10-05',
          description: 'Conta de Luz',
          categoryId: 'cat_home',
          paymentMethod: PaymentMethod.DEBITO,
          amount: 200,
          isRecurring: true,
        },
        {
          id: 'exp-2',
          date: '2025-09-12',
          description: 'Cinema',
          categoryId: 'cat_leisure',
          paymentMethod: PaymentMethod.CARTAO_CREDITO,
          amount: 120,
          isRecurring: false,
        },
      ],
      categories: [
        { id: 'cat_home', name: 'Casa', budget: 800 },
        { id: 'cat_leisure', name: 'Lazer', budget: 300 },
        { id: 'cat_extra', name: 'Extras', budget: 0 },
      ],
      salaries: [
        { id: 'sal-2025-10', year: 2025, month: 10, amount: 5000 },
      ],
    });

    const summary = await service.getSummary({ year: 2025, month: 10 });

    expect(summary.incomeTotal).toBe(5400);
    expect(summary.expenseTotal).toBe(200);
    expect(summary.balance).toBe(5200);

    const homeCategory = summary.byCategory.find(
      (item) => item.categoryId === 'cat_home',
    );
    expect(homeCategory?.total).toBe(200);
    expect(homeCategory?.percent).toBeCloseTo(25);

    const leisureCategory = summary.byCategory.find(
      (item) => item.categoryId === 'cat_leisure',
    );
    expect(leisureCategory?.total).toBe(0);
  });
});
