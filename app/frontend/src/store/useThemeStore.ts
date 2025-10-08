import { create } from 'zustand'

type Theme = 'light' | 'dark'

interface ThemeState {
  theme: Theme
  toggle: () => void
  setTheme: (theme: Theme) => void
}

const STORAGE_KEY = 'finance-theme'

const applyTheme = (theme: Theme) => {
  if (typeof document === 'undefined') {
    return
  }
  const root = document.documentElement
  if (theme === 'dark') {
    root.classList.add('dark')
  } else {
    root.classList.remove('dark')
  }
  root.setAttribute('data-theme', theme)
}

const getInitialTheme = (): Theme => {
  if (typeof window === 'undefined') {
    return 'light'
  }
  const stored = window.localStorage.getItem(STORAGE_KEY) as Theme | null
  if (stored === 'light' || stored === 'dark') {
    applyTheme(stored)
    return stored
  }
  const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
  const theme = prefersDark ? 'dark' : 'light'
  applyTheme(theme)
  return theme
}

export const useThemeStore = create<ThemeState>((set) => ({
  theme: getInitialTheme(),
  toggle: () =>
    set((state) => {
      const next = state.theme === 'light' ? 'dark' : 'light'
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(STORAGE_KEY, next)
      }
      applyTheme(next)
      return { theme: next }
    }),
  setTheme: (theme) => {
    applyTheme(theme)
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(STORAGE_KEY, theme)
    }
    set({ theme })
  },
}))
