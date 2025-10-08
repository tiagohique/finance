import { useEffect, useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import { Card } from '../components/common/Card'
import { DataTable, type TableColumn } from '../components/common/DataTable'
import { FormInput } from '../components/common/FormInput'
import { FormSelect } from '../components/common/FormSelect'
import { MoneyInput } from '../components/common/MoneyInput'
import { useFiltersStore } from '../store/useFiltersStore'
import { financeService } from '../services/financeService'
import type { Category, Expense, PaymentMethod } from '../services/types'
import { formatCurrency, formatDate } from '../utils/format'
import { getPeriodRange } from '../utils/period'
import { useToastStore } from '../store/useToastStore'
import { handleApiError } from '../services/api'

interface ExpenseFormState {
  date: string
  description: string
  categoryId: string
  paymentMethod: PaymentMethod | ''
  amount: string
  isRecurring: boolean
  notes: string
}

const emptyExpense: ExpenseFormState = {
  date: '',
  description: '',
  categoryId: '',
  paymentMethod: '',
  amount: '',
  isRecurring: false,
  notes: '',
}

const paymentLabels: Record<PaymentMethod, string> = {
  cartao_credito: 'Cartao de credito',
  debito: 'Debito',
  pix: 'PIX',
  dinheiro: 'Dinheiro',
}

export const ExpensesPage = () => {
  const { year, month } = useFiltersStore()
  const pushToast = useToastStore((state) => state.push)
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [form, setForm] = useState<ExpenseFormState>(emptyExpense)
  const [errors, setErrors] = useState<Partial<Record<keyof ExpenseFormState, string>>>({})
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [categoryFilter, setCategoryFilter] = useState('')
  const [recurringFilter, setRecurringFilter] = useState<'all' | 'recurring' | 'single'>('all')

  useEffect(() => {
    let active = true
    const load = async () => {
      setLoading(true)
      try {
        const range = getPeriodRange(year, month)
        const params = {
          ...range,
          categoryId: categoryFilter || undefined,
          recurring:
            recurringFilter === 'all'
              ? undefined
              : recurringFilter === 'recurring',
        }
        const [expenseResponse, categoryResponse] = await Promise.all([
          financeService.listExpenses(params),
          financeService.listCategories(),
        ])
        if (!active) return
        setExpenses(
          [...expenseResponse].sort((a, b) => b.date.localeCompare(a.date)),
        )
        setCategories(categoryResponse)
      } catch (error) {
        if (!active) return
        const apiError = handleApiError(error)
        pushToast({ intent: 'error', message: apiError.message })
      } finally {
        if (active) {
          setLoading(false)
        }
      }
    }
    load()
    return () => {
      active = false
    }
  }, [year, month, categoryFilter, recurringFilter, pushToast])

  const resetForm = () => {
    setForm(emptyExpense)
    setEditingId(null)
    setErrors({})
  }

  const validate = () => {
    const validation: Partial<Record<keyof ExpenseFormState, string>> = {}
    if (!form.date) validation.date = 'Informe a data'
    if (!form.description.trim()) validation.description = 'Descricao obrigatoria'
    if (!form.categoryId) validation.categoryId = 'Selecione a categoria'
    if (!form.paymentMethod)
      validation.paymentMethod = 'Escolha a forma de pagamento'
    if (!form.amount || Number(form.amount) <= 0)
      validation.amount = 'Informe um valor maior que zero'
    setErrors(validation)
    return Object.keys(validation).length === 0
  }

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    if (!validate()) return
    const payload = {
      date: form.date,
      description: form.description.trim(),
      categoryId: form.categoryId,
      paymentMethod: form.paymentMethod as PaymentMethod,
      amount: Number(form.amount),
      isRecurring: form.isRecurring,
      notes: form.notes.trim() || undefined,
    }
    try {
      if (editingId) {
        const updated = await financeService.updateExpense(editingId, payload)
        setExpenses((items) =>
          [...items.map((item) => (item.id === editingId ? updated : item))].sort(
            (a, b) => b.date.localeCompare(a.date),
          ),
        )
        pushToast({ intent: 'success', message: 'Despesa atualizada' })
      } else {
        const created = await financeService.createExpense(payload)
        setExpenses((items) =>
          [created, ...items].sort((a, b) => b.date.localeCompare(a.date)),
        )
        pushToast({ intent: 'success', message: 'Despesa cadastrada' })
      }
      resetForm()
    } catch (error) {
      const apiError = handleApiError(error)
      pushToast({ intent: 'error', message: apiError.message })
    }
  }

  const handleEdit = (expense: Expense) => {
    setEditingId(expense.id)
    setForm({
      date: expense.date,
      description: expense.description,
      categoryId: expense.categoryId,
      paymentMethod: expense.paymentMethod,
      amount: expense.amount.toString(),
      isRecurring: expense.isRecurring,
      notes: expense.notes ?? '',
    })
  }

  const handleDelete = async (expense: Expense) => {
    if (!window.confirm(`Remover despesa "${expense.description}"?`)) {
      return
    }
    try {
      await financeService.deleteExpense(expense.id)
      setExpenses((items) => items.filter((item) => item.id !== expense.id))
      pushToast({ intent: 'success', message: 'Despesa removida' })
      if (editingId === expense.id) {
        resetForm()
      }
    } catch (error) {
      const apiError = handleApiError(error)
      pushToast({ intent: 'error', message: apiError.message })
    }
  }

  const paymentOptions = useMemo(
    () =>
      (Object.keys(paymentLabels) as PaymentMethod[]).map((key) => ({
        value: key,
        label: paymentLabels[key],
      })),
    [],
  )

  const columns: Array<TableColumn<Expense>> = [
    { key: 'date', header: 'Data', render: (row) => formatDate(row.date) },
    { key: 'description', header: 'Descricao', render: (row) => row.description },
    {
      key: 'category',
      header: 'Categoria',
      render: (row) => categories.find((c) => c.id === row.categoryId)?.name ?? row.categoryId,
    },
    {
      key: 'paymentMethod',
      header: 'Pagamento',
      render: (row) => paymentLabels[row.paymentMethod],
    },
    {
      key: 'recurring',
      header: 'Recorrente',
      render: (row) => (row.isRecurring ? 'Sim' : 'Nao'),
    },
    {
      key: 'amount',
      header: 'Valor',
      align: 'right',
      render: (row) => formatCurrency(row.amount),
    },
    {
      key: 'actions',
      header: 'Acoes',
      align: 'right',
      render: (row) => (
        <div className="flex justify-end gap-2 text-xs">
          <button className="text-brand-600" onClick={() => handleEdit(row)}>
            Editar
          </button>
          <button className="text-rose-600" onClick={() => handleDelete(row)}>
            Excluir
          </button>
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <Card title={editingId ? 'Editar despesa' : 'Nova despesa'}>
        <form className="grid gap-4 md:grid-cols-2" onSubmit={handleSubmit}>
          <FormInput
            label="Data"
            type="date"
            name="date"
            value={form.date}
            onChange={(event) => setForm((prev) => ({ ...prev, date: event.target.value }))}
            error={errors.date}
            required
          />
          <FormSelect
            label="Categoria"
            name="categoryId"
            value={form.categoryId}
            onChange={(event) => setForm((prev) => ({ ...prev, categoryId: event.target.value }))}
            options={[{ label: 'Selecione...', value: '' }, ...categories.map((category) => ({
              label: category.name,
              value: category.id,
            }))]}
            error={errors.categoryId}
            required
          />
          <FormSelect
            label="Pagamento"
            name="paymentMethod"
            value={form.paymentMethod}
            onChange={(event) =>
              setForm((prev) => ({
                ...prev,
                paymentMethod: event.target.value as PaymentMethod | '',
              }))
            }
            options={[{ label: 'Selecione...', value: '' }, ...paymentOptions]}
            error={errors.paymentMethod}
            required
          />
          <MoneyInput
            label="Valor"
            name="amount"
            value={form.amount}
            onChange={(event) => setForm((prev) => ({ ...prev, amount: event.target.value }))}
            error={errors.amount}
          />
          <div className="flex items-center gap-2">
            <input
              id="isRecurring"
              type="checkbox"
              checked={form.isRecurring}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, isRecurring: event.target.checked }))
              }
              className="h-4 w-4 rounded border-slate-300 text-brand-500 focus:ring-brand-400 dark:border-slate-600 dark:bg-slate-900"
            />
            <label htmlFor="isRecurring" className="text-sm text-slate-600 dark:text-slate-300">
              Despesa recorrente (mensal)
            </label>
          </div>
          <FormInput
            label="Descricao"
            name="description"
            value={form.description}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, description: event.target.value }))
            }
            error={errors.description}
            className="md:col-span-2"
            required
          />
          <FormInput
            label="Observacoes"
            name="notes"
            value={form.notes}
            onChange={(event) => setForm((prev) => ({ ...prev, notes: event.target.value }))}
            className="md:col-span-2"
          />
          <div className="flex items-center justify-between md:col-span-2">
            <button
              type="submit"
              className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-600"
            >
              {editingId ? 'Salvar alteracoes' : 'Adicionar'}
            </button>
            {editingId && (
              <button type="button" className="text-sm text-slate-500 dark:text-slate-400" onClick={resetForm}>
                Cancelar
              </button>
            )}
          </div>
        </form>
      </Card>
      <Card
        title="Despesas do periodo"
        actions={
          <div className="flex gap-2 text-xs text-slate-500 dark:text-slate-400">
            {loading ? 'Carregando...' : `${expenses.length} itens`}
          </div>
        }
      >
        <div className="flex flex-wrap gap-3 pb-4 text-sm">
          <FormSelect
            label="Categoria"
            name="category-filter"
            value={categoryFilter}
            onChange={(event) => setCategoryFilter(event.target.value)}
            options={[{ label: 'Todas', value: '' }, ...categories.map((category) => ({
              label: category.name,
              value: category.id,
            }))]}
          />
          <FormSelect
            label="Tipo"
            name="recurring-filter"
            value={recurringFilter}
            onChange={(event) =>
              setRecurringFilter(event.target.value as typeof recurringFilter)
            }
            options={[
              { label: 'Todas', value: 'all' },
              { label: 'Recorrentes', value: 'recurring' },
              { label: 'Avulsas', value: 'single' },
            ]}
          />
        </div>
        <DataTable
          data={expenses}
          columns={columns}
          emptyMessage={loading ? 'Carregando...' : 'Nenhuma despesa encontrada'}
        />
      </Card>
    </div>
  )
}
