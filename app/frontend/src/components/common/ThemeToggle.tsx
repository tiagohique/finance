import { useThemeStore } from '../../store/useThemeStore'

export const ThemeToggle = () => {
  const theme = useThemeStore((state) => state.theme)
  const toggle = useThemeStore((state) => state.toggle)

  const label = theme === 'dark' ? 'Tema claro' : 'Tema escuro'

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={`Alternar para ${label}`}
      className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-600 transition hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
    >
      {theme === 'dark' ? 'Modo claro' : 'Modo escuro'}
    </button>
  )
}
