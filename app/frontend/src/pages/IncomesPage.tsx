import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { Card } from '../components/common/Card'
import { DataTable, type TableColumn } from '../components/common/DataTable'
import { FormInput } from '../components/common/FormInput'
import { FormSelect } from '../components/common/FormSelect'
import { MoneyInput } from '../components/common/MoneyInput'
import { useFiltersStore } from '../store/useFiltersStore'
import { financeService } from '../services/financeService'
import type { Category, Income } from '../services/types'
import { formatCurrency, formatDate } from '../utils/format'
import { getPeriodRange } from '../utils/period'
import { useToastStore } from '../store/useToastStore'
import { handleApiError } from '../services/api'

interface IncomeFormState {
  date: string
  description: string
  categoryId: string
  amount: string
}

const emptyForm: IncomeFormState = {
  date: '',
  description: '',
  categoryId: '',
  amount: '',
}

export const IncomesPage = () => {
  const { year, month } = useFiltersStore()
  const pushToast = useToastStore((state) => state.push)
  const [incomes, setIncomes] = useState<Income[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState<IncomeFormState>(emptyForm)
  const [errors, setErrors] = useState<Partial<Record<keyof IncomeFormState, string>>>({})
  const [editingId, setEditingId] = useState<string | null>(null)

  useEffect(() => {
    let active = true
    const load = async () => {
      setLoading(true)
      try {
        const range = getPeriodRange(year, month)
        const [incomeResponse, categoryResponse] = await Promise.all([
          financeService.listIncomes(range),
          financeService.listCategories(),
        ])
        if (!active) return
        setIncomes(
          [...incomeResponse].sort((a, b) => b.date.localeCompare(a.date)),
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
  }, [year, month, pushToast])

  const resetForm = () => {
    setForm(emptyForm)
    setEditingId(null)
    setErrors({})
  }

  const validate = () => {
    const validation: Partial<Record<keyof IncomeFormState, string>> = {}
    if (!form.date) validation.date = 'Informe a data'
    if (!form.description.trim()) validation.description = 'Descricao obrigatoria'
    if (!form.categoryId) validation.categoryId = 'Selecione a categoria'
    if (!form.amount || Number(form.amount) <= 0)
      validation.amount = 'Informe um valor maior que zero'
    setErrors(validation)
    return Object.keys(validation).length === 0
  }

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    if (!validate()) return
    try {
      const payload = {
        date: form.date,
        description: form.description.trim(),
        categoryId: form.categoryId,
        amount: Number(form.amount),
      }
      if (editingId) {
        const updated = await financeService.updateIncome(editingId, payload)
        setIncomes((items) =>
          [...items.map((item) => (item.id === editingId ? updated : item))].sort(
            (a, b) => b.date.localeCompare(a.date),
          ),
        )
        pushToast({ intent: 'success', message: 'Entrada atualizada com sucesso' })
      } else {
        const created = await financeService.createIncome(payload)
        setIncomes((items) =>
          [created, ...items].sort((a, b) => b.date.localeCompare(a.date)),
        )
        pushToast({ intent: 'success', message: 'Entrada cadastrada' })
      }
      resetForm()
    } catch (error) {
      const apiError = handleApiError(error)
      pushToast({ intent: 'error', message: apiError.message })
    }
  }

  const handleEdit = (income: Income) => {
    setEditingId(income.id)
    setForm({
      date: income.date,
      description: income.description,
      categoryId: income.categoryId,
      amount: income.amount.toString(),
    })
  }

  const handleDelete = async (income: Income) => {
    if (!window.confirm(`Remover entrada "${income.description}"?`)) {
      return
    }
    try {
      await financeService.deleteIncome(income.id)
      setIncomes((items) => items.filter((item) => item.id !== income.id))
      pushToast({ intent: 'success', message: 'Entrada removida' })
      if (editingId === income.id) {
        resetForm()
      }
    } catch (error) {
      const apiError = handleApiError(error)
      pushToast({ intent: 'error', message: apiError.message })
    }
  }

  const columns: Array<TableColumn<Income>> = [
    { key: 'date', header: 'Data', render: (row) => formatDate(row.date) },
    { key: 'description', header: 'Descricao', render: (row) => row.description },
    {
      key: 'category',
      header: 'Categoria',
      render: (row) => categories.find((c) => c.id === row.categoryId)?.name ?? row.categoryId,
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
    <div className="grid gap-6 lg:grid-cols-[320px,1fr]">
      <Card title={editingId ? 'Editar entrada' : 'Nova entrada'}>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <FormInput
            label="Data"
            type="date"
            name="date"
            value={form.date}
            onChange={(event) => setForm((prev) => ({ ...prev, date: event.target.value }))}
            error={errors.date}
            required
          />
          <FormInput
            label="Descricao"
            name="description"
            value={form.description}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, description: event.target.value }))
            }
            error={errors.description}
            required
          />
          <FormSelect
            label="Categoria"
            name="categoryId"
            value={form.categoryId}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, categoryId: event.target.value }))
            }
            options={[{ label: 'Selecione...', value: '' }, ...categories.map((category) => ({
              label: category.name,
              value: category.id,
            }))]}
            error={errors.categoryId}
            required
          />
          <MoneyInput
            label="Valor"
            name="amount"
            value={form.amount}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, amount: event.target.value }))
            }
            error={errors.amount}
          />
          <div className="flex items-center justify-between">
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
        title="Entradas do periodo"
        actions={
          <span className="text-xs text-slate-500 dark:text-slate-400">
            {loading ? 'Carregando...' : `${incomes.length} itens`}
          </span>
        }
      >
        <DataTable data={incomes} columns={columns} emptyMessage={loading ? 'Carregando...' : 'Nenhuma entrada cadastrada'} />
      </Card>
    </div>
  )
}
