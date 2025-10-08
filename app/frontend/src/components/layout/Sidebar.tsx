import { NavLink, useNavigate } from 'react-router-dom'
import clsx from 'clsx'
import { useAuthStore } from '../../store/useAuthStore'

const links = [
  { to: '/', label: 'Dashboard' },
  { to: '/incomes', label: 'Entradas' },
  { to: '/expenses', label: 'Saidas' },
  { to: '/categories', label: 'Categorias' },
  { to: '/reports', label: 'Relatorios' },
]

interface SidebarProps {
  visible: boolean
  onClose: () => void
}

export const Sidebar = ({ visible, onClose }: SidebarProps) => {
  const navigate = useNavigate()
  const clearAuth = useAuthStore((state) => state.clearAuth)

  const handleLogout = () => {
    clearAuth()
    onClose()
    navigate('/login', { replace: true })
  }

  return (
    <aside
      className={clsx(
        'fixed inset-y-0 left-0 z-30 w-64 border-r border-slate-200 bg-white px-4 py-6 transition-transform duration-200 ease-in-out md:static md:translate-x-0 dark:border-slate-800 dark:bg-slate-900',
        {
          '-translate-x-full': !visible,
          'translate-x-0': visible,
        },
      )}
    >
      <nav className="flex flex-col gap-1">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.to === '/'}
            onClick={onClose}
            className={({ isActive }) =>
              clsx(
                'rounded-lg px-3 py-2 text-sm font-medium transition',
                isActive
                  ? 'bg-brand-50 text-brand-700 dark:bg-brand-500/20 dark:text-brand-200'
                  : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800',
              )
            }
          >
            {link.label}
          </NavLink>
        ))}

        <div className="my-3 border-t border-slate-200 dark:border-slate-800" />
        <button
          type="button"
          onClick={handleLogout}
          className="rounded-lg px-3 py-2 text-left text-sm font-medium text-slate-600 transition hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
        >
          Sair
        </button>
      </nav>
    </aside>
  )
}
