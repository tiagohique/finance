export type PaymentMethod =
  | 'cartao_credito'
  | 'debito'
  | 'pix'
  | 'dinheiro'

export interface Salary {
  id: string
  userId: string
  year: number
  month: number
  amount: number
}

export interface Income {
  id: string
  userId: string
  date: string
  description: string
  categoryId: string
  amount: number
}

export interface Expense {
  id: string
  userId: string
  date: string
  description: string
  categoryId: string
  paymentMethod: PaymentMethod
  amount: number
  isRecurring: boolean
  notes?: string
}

export interface Category {
  id: string
  userId: string
  name: string
  budget: number
}

export interface CategorySummary {
  categoryId: string
  total: number
  budget: number
  percent: number
}

export interface SummaryResponse {
  incomeTotal: number
  expenseTotal: number
  balance: number
  byCategory: CategorySummary[]
}

export interface ApiError {
  message: string
  status?: number
}

export interface ListParams {
  from?: string
  to?: string
  categoryId?: string
  recurring?: boolean
}

export interface User {
  id: string
  name: string
  username: string
}

export interface AuthResponse {
  token: string
  user: User
}
