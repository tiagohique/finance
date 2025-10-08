import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { Card } from '../components/common/Card'
import { DataTable, type TableColumn } from '../components/common/DataTable'
import { FormInput } from '../components/common/FormInput'
import { MoneyInput } from '../components/common/MoneyInput'
import { financeService } from '../services/financeService'
import type { Category } from '../services/types'
import { formatCurrency } from '../utils/format'
import { useToastStore } from '../store/useToastStore'
import { handleApiError } from '../services/api'

interface CategoryForm {
  name: string
  budget: string
}

const emptyCategory: CategoryForm = {
  name: '',
  budget: '',
}

export const CategoriesPage = () => {
  const pushToast = useToastStore((state) => state.push)
  const [categories, setCategories] = useState<Category[]>([])
  const [form, setForm] = useState<CategoryForm>(emptyCategory)
  const [errors, setErrors] = useState<Partial<Record<keyof CategoryForm, string>>>({})
  const [editingId, setEditingId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    const load = async () => {
      setLoading(true)
      try {
        const data = await financeService.listCategories()
        if (!active) return
        setCategories(data.sort((a, b) => a.name.localeCompare(b.name)))
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
  }, [pushToast])

  const resetForm = () => {
    setForm(emptyCategory)
    setEditingId(null)
    setErrors({})
  }

  const validate = () => {
    const validation: Partial<Record<keyof CategoryForm, string>> = {}
    if (!form.name.trim()) validation.name = 'Nome obrigatorio'
    if (form.budget && Number(form.budget) < 0)
      validation.budget = 'Orcamento deve ser positivo'
    setErrors(validation)
    return Object.keys(validation).length === 0
  }

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    if (!validate()) return
    const payload = {
      name: form.name.trim(),
      budget: form.budget ? Number(form.budget) : undefined,
    }
    try {
      if (editingId) {
        const updated = await financeService.updateCategory(editingId, payload)
        setCategories((items) =>
          [...items.map((item) => (item.id === editingId ? updated : item))].sort(
            (a, b) => a.name.localeCompare(b.name),
          ),
        )
        pushToast({ intent: 'success', message: 'Categoria atualizada' })
      } else {
        const created = await financeService.createCategory(payload)
        setCategories((items) =>
          [...items, created].sort((a, b) => a.name.localeCompare(b.name)),
        )
        pushToast({ intent: 'success', message: 'Categoria criada' })
      }
      resetForm()
    } catch (error) {
      const apiError = handleApiError(error)
      pushToast({ intent: 'error', message: apiError.message })
    }
  }

  const handleEdit = (category: Category) => {
    setEditingId(category.id)
    setForm({ name: category.name, budget: category.budget.toString() })
  }

  const handleDelete = async (category: Category) => {
    if (!window.confirm(`Remover categoria "${category.name}"?`)) {
      return
    }
    try {
      await financeService.deleteCategory(category.id)
      setCategories((items) => items.filter((item) => item.id !== category.id))
      pushToast({ intent: 'success', message: 'Categoria removida' })
      if (editingId === category.id) {
        resetForm()
      }
    } catch (error) {
      const apiError = handleApiError(error)
      pushToast({ intent: 'error', message: apiError.message })
    }
  }

  const columns: Array<TableColumn<Category>> = [
    { key: 'name', header: 'Nome', render: (row) => row.name },
    {
      key: 'budget',
      header: 'Orcamento mensal',
      align: 'right',
      render: (row) => formatCurrency(row.budget),
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
      <Card title={editingId ? 'Editar categoria' : 'Nova categoria'}>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <FormInput
            label="Nome"
            name="name"
            value={form.name}
            onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
            error={errors.name}
            required
          />
          <MoneyInput
            label="Orcamento mensal"
            name="budget"
            value={form.budget}
            onChange={(event) => setForm((prev) => ({ ...prev, budget: event.target.value }))}
            error={errors.budget}
            min={0}
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
        title="Categorias"
        actions={
          <span className="text-xs text-slate-500 dark:text-slate-400">
            {loading ? 'Carregando...' : `${categories.length} itens`}
          </span>
        }
      >
        <DataTable
          data={categories}
          columns={columns}
          emptyMessage={loading ? 'Carregando...' : 'Nenhuma categoria cadastrada'}
        />
      </Card>
    </div>
  )
}
