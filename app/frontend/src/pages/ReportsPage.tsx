import { useEffect, useState } from 'react'
import { Card } from '../components/common/Card'
import { DataTable, type TableColumn } from '../components/common/DataTable'
import { useFiltersStore } from '../store/useFiltersStore'
import { financeService } from '../services/financeService'
import type { CategorySummary } from '../services/types'
import { formatCurrency, formatPercent } from '../utils/format'
import { useToastStore } from '../store/useToastStore'
import { handleApiError } from '../services/api'

interface ReportState {
  incomeTotal: number
  expenseTotal: number
  balance: number
  byCategory: CategorySummary[]
  categoryNames: Record<string, string>
  loading: boolean
}

const initialState: ReportState = {
  incomeTotal: 0,
  expenseTotal: 0,
  balance: 0,
  byCategory: [],
  categoryNames: {},
  loading: true,
}

export const ReportsPage = () => {
  const { year, month } = useFiltersStore()
  const pushToast = useToastStore((state) => state.push)
  const [state, setState] = useState<ReportState>(initialState)
  const [exporting, setExporting] = useState(false)

  useEffect(() => {
    let active = true
    const load = async () => {
      setState((prev) => ({ ...prev, loading: true }))
      try {
        const [summary, categories] = await Promise.all([
          financeService.getSummary({ year, month }),
          financeService.listCategories(),
        ])
        if (!active) return
        setState({
          incomeTotal: summary.incomeTotal,
          expenseTotal: summary.expenseTotal,
          balance: summary.balance,
          byCategory: summary.byCategory,
          categoryNames: Object.fromEntries(
            categories.map((category) => [category.id, category.name]),
          ),
          loading: false,
        })
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

  const handleExport = async () => {
    try {
      setExporting(true)
      const blob = await financeService.exportCsv({ year, month })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `relatorio-${year}-${month.toString().padStart(2, '0')}.csv`
      document.body.appendChild(link)
      link.click()
      link.remove()
      URL.revokeObjectURL(url)
      pushToast({ intent: 'success', message: 'CSV exportado com sucesso' })
    } catch (error) {
      const apiError = handleApiError(error)
      pushToast({ intent: 'error', message: apiError.message })
    } finally {
      setExporting(false)
    }
  }

  const columns: Array<TableColumn<CategorySummary>> = [
    {
      key: 'category',
      header: 'Categoria',
      render: (row) => state.categoryNames[row.categoryId] ?? row.categoryId,
    },
    {
      key: 'total',
      header: 'Total gasto',
      align: 'right',
      render: (row) => formatCurrency(row.total),
    },
    {
      key: 'budget',
      header: 'Orcamento',
      align: 'right',
      render: (row) => formatCurrency(row.budget),
    },
    {
      key: 'percent',
      header: '% utilizado',
      align: 'right',
      render: (row) => formatPercent(row.percent),
    },
  ]

  return (
    <div className="space-y-6">
      <Card
        title="Resumo do mes"
        actions={
          <button
            type="button"
            className="rounded-lg border border-brand-500 px-3 py-2 text-sm font-semibold text-brand-600 transition hover:bg-brand-50 dark:border-brand-400 dark:text-brand-200 dark:hover:bg-brand-500/20"
            onClick={handleExport}
            disabled={exporting}
          >
            {exporting ? 'Exportando...' : 'Exportar CSV'}
          </button>
        }
      >
        {state.loading ? (
          <p className="text-sm text-slate-500 dark:text-slate-400">Carregando...</p>
        ) : (
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <p className="text-xs uppercase text-slate-500 dark:text-slate-400">Entradas</p>
              <p className="text-2xl font-semibold text-emerald-600">
                {formatCurrency(state.incomeTotal)}
              </p>
            </div>
            <div>
              <p className="text-xs uppercase text-slate-500 dark:text-slate-400">Saidas</p>
              <p className="text-2xl font-semibold text-rose-600">
                {formatCurrency(state.expenseTotal)}
              </p>
            </div>
            <div>
              <p className="text-xs uppercase text-slate-500 dark:text-slate-400">Saldo</p>
              <p
                className={`text-2xl font-semibold ${
                  state.balance >= 0 ? 'text-emerald-600' : 'text-rose-600'
                }`}
              >
                {formatCurrency(state.balance)}
              </p>
            </div>
          </div>
        )}
      </Card>
      <Card title="Gastos por categoria">
        <DataTable
          data={state.byCategory}
          columns={columns}
          emptyMessage={state.loading ? 'Carregando...' : 'Nenhuma categoria encontrada'}
        />
      </Card>
    </div>
  )
}
