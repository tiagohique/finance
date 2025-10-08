import { create } from 'zustand'

const STORAGE_KEY = 'finance-filters'

interface FiltersState {
  year: number
  month: number
  setPeriod: (params: { year: number; month: number }) => void
}

const getInitialState = (): { year: number; month: number } => {
  const today = new Date()
  const fallback = { year: today.getFullYear(), month: today.getMonth() + 1 }
  if (typeof window === 'undefined') {
    return fallback
  }
  try {
    const saved = window.localStorage.getItem(STORAGE_KEY)
    if (!saved) {
      return fallback
    }
    const parsed = JSON.parse(saved) as { year: number; month: number }
    if (
      typeof parsed.year === 'number' &&
      typeof parsed.month === 'number' &&
      parsed.month >= 1 &&
      parsed.month <= 12
    ) {
      const monthOffset =
        (parsed.year - fallback.year) * 12 + (parsed.month - fallback.month)
      if (Math.abs(monthOffset) > 12) {
        // Periodo salvo muito antigo ou futuro: volta para data atual
        window.localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify(fallback),
        )
        return fallback
      }
      return parsed
    }
    return fallback
  } catch (error) {
    console.warn('Failed to parse stored filters', error)
    return fallback
  }
}

export const useFiltersStore = create<FiltersState>((set) => ({
  ...getInitialState(),
  setPeriod: ({ year, month }) => {
    set({ year, month })
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ year, month }),
      )
    }
  },
}))
