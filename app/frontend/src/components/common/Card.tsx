import { type ReactNode } from 'react'
import clsx from 'clsx'

interface CardProps {
  title?: string
  children: ReactNode
  className?: string
  actions?: ReactNode
}

export const Card = ({ title, children, actions, className }: CardProps) => (
  <section
    className={clsx(
      'w-full overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-900/5 dark:border-slate-800 dark:bg-slate-900 dark:shadow-slate-950/20',
      className,
    )}
  >
    {(title || actions) && (
      <header className="mb-4 flex items-center justify-between">
        {title && (
          <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100">
            {title}
          </h2>
        )}
        {actions}
      </header>
    )}
    <div className="space-y-4 text-sm text-slate-700 dark:text-slate-300">
      {children}
    </div>
  </section>
)
