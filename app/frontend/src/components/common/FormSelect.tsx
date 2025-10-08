import { forwardRef, type SelectHTMLAttributes, type ReactNode } from 'react'
import clsx from 'clsx'

export interface OptionItem {
  value: string | number
  label: ReactNode
}

interface FormSelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string
  options: OptionItem[]
  error?: string
}

export const FormSelect = forwardRef<HTMLSelectElement, FormSelectProps>(
  ({ label, options, error, className, id, ...props }, ref) => {
    const selectId = id ?? `select-${props.name}`

    return (
      <label className="flex flex-col gap-1 text-sm" htmlFor={selectId}>
        <span className="font-medium text-slate-700 dark:text-slate-200">{label}</span>
        <select
          ref={ref}
          id={selectId}
          className={clsx(
            'rounded-lg border px-3 py-2 outline-none transition focus:ring-2 focus:ring-brand-400 dark:bg-slate-900 dark:text-slate-100',
            error
              ? 'border-rose-400 focus:border-rose-400'
              : 'border-slate-200 focus:border-brand-400 dark:border-slate-700 dark:focus:border-brand-300',
            className,
          )}
          {...props}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        {error && <span className="text-xs text-rose-500 dark:text-rose-400">{error}</span>}
      </label>
    )
  },
)

FormSelect.displayName = 'FormSelect'
