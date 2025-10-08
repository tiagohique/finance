import { forwardRef, type InputHTMLAttributes } from 'react'
import clsx from 'clsx'

interface FormInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string
  error?: string
}

export const FormInput = forwardRef<HTMLInputElement, FormInputProps>(
  ({ label, error, className, id, ...props }, ref) => {
    const inputId = id ?? `input-${props.name}`

    return (
      <label className="flex flex-col gap-1 text-sm" htmlFor={inputId}>
        <span className="font-medium text-slate-700 dark:text-slate-200">{label}</span>
        <input
          ref={ref}
          id={inputId}
          className={clsx(
            'rounded-lg border px-3 py-2 outline-none transition focus:ring-2 focus:ring-brand-400 dark:bg-slate-900 dark:text-slate-100',
            error
              ? 'border-rose-400 focus:border-rose-400'
              : 'border-slate-200 focus:border-brand-400 dark:border-slate-700 dark:focus:border-brand-300',
            className,
          )}
          {...props}
        />
        {error && <span className="text-xs text-rose-500 dark:text-rose-400">{error}</span>}
      </label>
    )
  },
)

FormInput.displayName = 'FormInput'
