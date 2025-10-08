import { api } from './api'
import type {
  Category,
  CategorySummary,
  Expense,
  Income,
  ListParams,
  PaymentMethod,
  Salary,
  SummaryResponse,
} from './types'

export interface PeriodParams {
  year: number
  month: number
}

export interface IncomePayload {
  date: string
  description: string
  categoryId: string
  amount: number
}

export interface ExpensePayload {
  date: string
  description: string
  categoryId: string
  paymentMethod: PaymentMethod
  amount: number
  isRecurring: boolean
  notes?: string
}

export interface CategoryPayload {
  name: string
  budget?: number
}

export const financeService = {
  async getSummary(period: PeriodParams): Promise<SummaryResponse> {
    const { data } = await api.get<SummaryResponse>('/reports/summary', {
      params: period,
    })
    return data
  },

  async getSalary(period: PeriodParams): Promise<Salary | undefined> {
    try {
      const { data } = await api.get<Salary>(
        `/salaries/${period.year}/${period.month}`,
      )
      return data
    } catch (error) {
      if ((error as any).response?.status === 404) {
        return undefined
      }
      throw error
    }
  },

  async upsertSalary(period: PeriodParams, amount: number): Promise<Salary> {
    const { data } = await api.put<Salary>(
      `/salaries/${period.year}/${period.month}`,
      { amount },
    )
    return data
  },

  async listIncomes(params: ListParams): Promise<Income[]> {
    const { data } = await api.get<Income[]>('/incomes', {
      params,
    })
    return data
  },

  async createIncome(payload: IncomePayload): Promise<Income> {
    const { data } = await api.post<Income>('/incomes', payload)
    return data
  },

  async updateIncome(id: string, payload: Partial<IncomePayload>): Promise<Income> {
    const { data } = await api.put<Income>(`/incomes/${id}`, payload)
    return data
  },

  async deleteIncome(id: string): Promise<void> {
    await api.delete(`/incomes/${id}`)
  },

  async listExpenses(params: ListParams): Promise<Expense[]> {
    const { data } = await api.get<Expense[]>('/expenses', {
      params,
    })
    return data
  },

  async createExpense(payload: ExpensePayload): Promise<Expense> {
    const { data } = await api.post<Expense>('/expenses', payload)
    return data
  },

  async updateExpense(
    id: string,
    payload: Partial<ExpensePayload>,
  ): Promise<Expense> {
    const { data } = await api.put<Expense>(`/expenses/${id}`, payload)
    return data
  },

  async deleteExpense(id: string): Promise<void> {
    await api.delete(`/expenses/${id}`)
  },

  async listCategories(): Promise<Category[]> {
    const { data } = await api.get<Category[]>('/categories')
    return data
  },

  async createCategory(payload: CategoryPayload): Promise<Category> {
    const { data } = await api.post<Category>('/categories', payload)
    return data
  },

  async updateCategory(
    id: string,
    payload: Partial<CategoryPayload>,
  ): Promise<Category> {
    const { data } = await api.put<Category>(`/categories/${id}`, payload)
    return data
  },

  async deleteCategory(id: string): Promise<void> {
    await api.delete(`/categories/${id}`)
  },

  async exportCsv(period: PeriodParams): Promise<Blob> {
    const { data } = await api.get<Blob>(`/reports/export/csv`, {
      params: period,
      responseType: 'blob',
    })
    return data
  },
}

export type { CategorySummary }
