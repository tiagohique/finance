import { Link } from 'react-router-dom'
import { MonthPicker } from '../common/MonthPicker'
import { ThemeToggle } from '../common/ThemeToggle'
import { useAuthStore } from '../../store/useAuthStore'

interface NavbarProps {
  onToggleSidebar: () => void
}

export const Navbar = ({ onToggleSidebar }: NavbarProps) => {
  const userName = useAuthStore((state) => state.user?.name ?? 'Dashboard')
  

  return (
    <header className="sticky top-0 z-40 flex items-center justify-between border-b border-slate-200 bg-white/95 px-4 py-3 backdrop-blur dark:border-slate-700 dark:bg-slate-900/90">
      <div className="flex items-center gap-3">
        <button
          type="button"
          className="rounded-md border border-slate-200 px-3 py-2 text-slate-600 hover:bg-slate-100 md:hidden dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
          aria-label="Abrir menu"
          onClick={onToggleSidebar}
        >
          ≡
        </button>
        <Link
          to="/"
          className="flex items-center gap-2 text-xl font-bold text-brand-600 transition hover:text-brand-500 dark:text-brand-400 dark:hover:text-brand-300"
        >
          {userName}
        </Link>
      </div>
      <div className="flex flex-wrap items-center justify-end gap-2 sm:gap-3">
        <ThemeToggle />
        <MonthPicker />
      </div>
    </header>
  )
}
