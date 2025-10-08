import { useMemo } from 'react'
import { useFiltersStore } from '../../store/useFiltersStore'
import { monthName } from '../../utils/format'

const MONTHS = Array.from({ length: 12 }, (_, index) => index + 1)
const MONTH_FULL_NAMES = [
  'Janeiro',
  'Fevereiro',
  'Marco',
  'Abril',
  'Maio',
  'Junho',
  'Julho',
  'Agosto',
  'Setembro',
  'Outubro',
  'Novembro',
  'Dezembro',
]

export const MonthPicker = () => {
  const { year, month, setPeriod } = useFiltersStore()

  const yearOptions = useMemo(() => {
    const currentYear = new Date().getFullYear()
    const base = Array.from({ length: 7 }, (_, index) => currentYear - 3 + index)
    return base.includes(year) ? base : [...base, year].sort((a, b) => a - b)
  }, [year])

  const handlePrev = () => {
    const prevMonth = month - 1 || 12
    const prevYear = prevMonth === 12 ? year - 1 : year
    setPeriod({ year: prevYear, month: prevMonth })
  }

  const handleNext = () => {
    const nextMonth = month === 12 ? 1 : month + 1
    const nextYear = month === 12 ? year + 1 : year
    setPeriod({ year: nextYear, month: nextMonth })
  }

  return (
    <div className="flex flex-wrap items-center gap-2 text-sm">
      <button
        type="button"
        aria-label="Mes anterior"
        className="rounded-md border border-slate-200 px-2 py-1 text-slate-600 transition hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
        onClick={handlePrev}
      >
        {'<'}
      </button>
      <div className="hidden items-center gap-2 md:flex">
        <label className="text-slate-500 dark:text-slate-300" htmlFor="month-select">
          Mes
        </label>
        <select
          id="month-select"
          className="rounded-md border border-slate-200 px-2 py-1 transition dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
          value={month}
          onChange={(event) =>
            setPeriod({ month: Number(event.target.value), year })
          }
        >
          {MONTHS.map((item) => (
            <option key={item} value={item}>
              {MONTH_FULL_NAMES[item - 1]} {year}
            </option>
          ))}
        </select>
        <label className="text-slate-500 dark:text-slate-300" htmlFor="year-select">
          Ano
        </label>
        <select
          id="year-select"
          className="rounded-md border border-slate-200 px-2 py-1 transition dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
          value={year}
          onChange={(event) =>
            setPeriod({ year: Number(event.target.value), month })
          }
        >
          {yearOptions.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </div>
      <div className="md:hidden">
        <span className="font-medium text-slate-700 dark:text-slate-200">
          {`${monthName(month)}, ${year}`}
        </span>
      </div>
      <button
        type="button"
        aria-label="Proximo mes"
        className="rounded-md border border-slate-200 px-2 py-1 text-slate-600 transition hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
        onClick={handleNext}
      >
        {'>'}
      </button>
    </div>
  )
}
