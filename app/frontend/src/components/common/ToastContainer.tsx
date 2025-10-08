import { useToastStore } from '../../store/useToastStore'
import clsx from 'clsx'

const intentStyles: Record<string, string> = {
  success: 'bg-emerald-500 text-white dark:bg-emerald-600',
  error: 'bg-rose-500 text-white dark:bg-rose-600',
  info: 'bg-slate-700 text-white dark:bg-slate-800',
}

export const ToastContainer = () => {
  const { toasts, dismiss } = useToastStore()

  if (!toasts.length) {
    return null
  }

  return (
    <div className="fixed right-4 top-4 z-50 flex flex-col gap-2">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          role="status"
          className={clsx(
            'flex items-center gap-3 rounded-lg px-4 py-3 shadow-lg shadow-slate-900/10 dark:shadow-slate-950/40',
            intentStyles[toast.intent],
          )}
        >
          <span className="grow text-sm font-medium">{toast.message}</span>
          <button
            type="button"
            aria-label="Fechar alerta"
            className="text-sm font-semibold"
            onClick={() => dismiss(toast.id)}
          >
            x
          </button>
        </div>
      ))}
    </div>
  )
}
