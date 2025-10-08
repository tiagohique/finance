import { useEffect, useMemo, useState } from 'react'
import { Card } from '../components/common/Card'
import { DataTable, type TableColumn } from '../components/common/DataTable'
import { MoneyInput } from '../components/common/MoneyInput'
import { useFiltersStore } from '../store/useFiltersStore'
import { financeService } from '../services/financeService'
import type { CategorySummary, Expense, Income, Salary } from '../services/types'
import { formatCurrency, formatDate } from '../utils/format'
import { getPeriodRange } from '../utils/period'
import { useToastStore } from '../store/useToastStore'
import { handleApiError } from '../services/api'

interface DashboardState {
  summary: CategorySummary[]
  incomeTotal: number
  expenseTotal: number
  balance: number
  salary?: Salary
  incomes: Income[]
  expenses: Expense[]
  categoryMap: Record<string, string>
  loading: boolean
}

export const DashboardPage = () => {
  const { year, month } = useFiltersStore()
  const pushToast = useToastStore((state) => state.push)
  const [
    {
      summary,
      incomeTotal,
      expenseTotal,
      balance,
      salary,
      incomes,
      expenses,
      categoryMap,
      loading,
    },
    setState,
  ] =
    useState<DashboardState>({
      summary: [],
      incomeTotal: 0,
      expenseTotal: 0,
      balance: 0,
      salary: undefined,
      incomes: [],
      expenses: [],
      categoryMap: {},
      loading: true,
    })
  const [salaryInput, setSalaryInput] = useState('')
  const [salaryError, setSalaryError] = useState<string | undefined>()
  const [updatingSalary, setUpdatingSalary] = useState(false)

  useEffect(() => {
    let active = true
    const load = async () => {
      setState((prev) => ({ ...prev, loading: true }))
      try {
        const period = { year, month }
        const range = getPeriodRange(year, month)
        const [
          summaryResponse,
          monthIncomes,
          monthExpenses,
          salaryValue,
          categories,
        ] =
          await Promise.all([
            financeService.getSummary(period),
            financeService.listIncomes(range),
            financeService.listExpenses(range),
            financeService.getSalary(period),
            financeService.listCategories(),
          ])
        if (!active) return
        setState({
          summary: summaryResponse.byCategory,
          incomeTotal: summaryResponse.incomeTotal,
          expenseTotal: summaryResponse.expenseTotal,
          balance: summaryResponse.balance,
          salary: salaryValue,
          incomes: monthIncomes,
          expenses: monthExpenses,
          categoryMap: Object.fromEntries(
            categories.map((category) => [category.id, category.name]),
          ),
          loading: false,
        })
        setSalaryInput(salaryValue?.amount ? salaryValue.amount.toString() : '')
      } catch (error) {
        if (!active) return
        const apiError = handleApiError(error)
        pushToast({ intent: 'error', message: apiError.message })
        setState((prev) => ({ ...prev, loading: false }))
      }
    }
    load()
    return () => {
      active = false
    }
  }, [year, month, pushToast])

  const latestTransactions = useMemo(() => {
    const mapped = [
      ...incomes.map((income) => ({
        id: income.id,
        type: 'Entrada',
        date: income.date,
        description: income.description,
        amount: income.amount,
      })),
      ...expenses.map((expense) => ({
        id: expense.id,
        type: expense.isRecurring ? 'Saida (Rec.)' : 'Saida',
        date: expense.date,
        description: expense.description,
        amount: -expense.amount,
      })),
    ]
    return mapped
      .sort((a, b) => b.date.localeCompare(a.date))
      .slice(0, 8)
  }, [incomes, expenses])

  const transactionColumns: Array<TableColumn<(typeof latestTransactions)[number]>> = [
    {
      key: 'date',
      header: 'Data',
      render: (row) => <span className="block whitespace-nowrap">{formatDate(row.date)}</span>,
    },
    {
      key: 'type',
      header: 'Tipo',
      render: (row) => <span className="block whitespace-nowrap">{row.type}</span>,
    },
    {
      key: 'description',
      header: 'Descricao',
      render: (row) => <span className="block">{row.description}</span>,
    },
    {
      key: 'amount',
      header: 'Valor',
      align: 'right',
      render: (row) => (
        <span className={row.amount >= 0 ? 'text-emerald-600' : 'text-rose-600'}>
          {formatCurrency(row.amount)}
        </span>
      ),
    },
  ]

  const salaryAmount = salary?.amount ?? 0

  const handleUpdateSalary = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!salaryInput || Number(salaryInput) <= 0) {
      setSalaryError('Informe um valor maior que zero')
      return
    }
    setSalaryError(undefined)
    try {
      setUpdatingSalary(true)
      const updated = await financeService.upsertSalary(
        { year, month },
        Number(salaryInput),
      )
      setState((prev) => ({ ...prev, salary: updated }))
      pushToast({ intent: 'success', message: 'Salario atualizado' })
    } catch (error) {
      const apiError = handleApiError(error)
      pushToast({ intent: 'error', message: apiError.message })
    } finally {
      setUpdatingSalary(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-4">
        <Card title="Salario" className="md:col-span-1">
          <div className="space-y-3">
            <div className="text-2xl font-semibold text-slate-800">
              {formatCurrency(salaryAmount)}
            </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Ultima atualizacao: {salary ? `${year}/${String(month).padStart(2, '0')}` : 'sem registro'}
          </p>
            <form className="space-y-2" onSubmit={handleUpdateSalary}>
              <MoneyInput
                label="Atualizar salario"
                name="salary"
                value={salaryInput}
                onChange={(event) => setSalaryInput(event.target.value)}
                error={salaryError}
              />
              <button
                type="submit"
                className="w-full rounded-lg bg-brand-500 px-3 py-2 text-sm font-semibold text-white hover:bg-brand-600 disabled:opacity-60"
                disabled={updatingSalary}
              >
                {updatingSalary ? 'Salvando...' : 'Salvar' }
              </button>
            </form>
          </div>
        </Card>
        <Card title="Entradas" className="md:col-span-1">
          <div className="text-2xl font-semibold text-emerald-600">
            {formatCurrency(incomeTotal)}
          </div>
        </Card>
        <Card title="Saidas" className="md:col-span-1">
          <div className="text-2xl font-semibold text-rose-600">
            {formatCurrency(expenseTotal)}
          </div>
        </Card>
        <Card title="Saldo" className="md:col-span-1">
          <div
            className={`text-2xl font-semibold ${balance >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}
          >
            {formatCurrency(balance)}
          </div>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-5">
        <Card title="Gastos por categoria" className="lg:col-span-3">
          {loading ? (
            <p className="text-sm text-slate-500 dark:text-slate-400">Carregando...</p>
          ) : (
            <div className="space-y-3">
              {summary.map((item) => {
                const percentValue = item.percent ?? 0
                const percent = Math.min(percentValue, 100)
                const isOverBudget = percentValue > 100
                return (
                  <div key={item.categoryId} className="space-y-1">
                    <div className="flex flex-wrap items-center justify-between gap-y-1 text-xs text-slate-500 dark:text-slate-400">
                      <span className="max-w-[55%] break-words">
                        {categoryMap[item.categoryId] ?? item.categoryId}
                      </span>
                      <span className="text-right text-xs sm:text-sm">
                        {formatCurrency(item.total)}{' '}
                        {item.budget > 0 && (
                          <span className="text-slate-400">
                            / {formatCurrency(item.budget)}
                          </span>
                        )}
                      </span>
                    </div>
                    <div className="h-3 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                      <div
                        className={`h-3 rounded-full ${isOverBudget ? 'bg-rose-500' : 'bg-brand-500'}`}
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                    <span className="block text-xs text-slate-400 dark:text-slate-500">
                      Orcamento usado: {percentValue.toFixed(0)}%
                    </span>
                  </div>
                )
              })}
            </div>
          )}
        </Card>
        <Card title="Ultimos lancamentos" className="lg:col-span-2">
          {loading ? (
            <p className="text-sm text-slate-500 dark:text-slate-400">Carregando...</p>
          ) : (
            <DataTable data={latestTransactions} columns={transactionColumns} dense />
          )}
        </Card>
      </div>
    </div>
  )
}
