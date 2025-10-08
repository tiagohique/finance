import { create } from 'zustand'
import type { User } from '../services/types'

const STORAGE_KEY = 'finance-auth'

interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  setAuth: (payload: { user: User; token: string }) => void
  clearAuth: () => void
}

const getInitialState = (): Pick<AuthState, 'user' | 'token' | 'isAuthenticated'> => {
  if (typeof window === 'undefined') {
    return { user: null, token: null, isAuthenticated: false }
  }

  try {
    const stored = window.localStorage.getItem(STORAGE_KEY)
    if (!stored) {
      return { user: null, token: null, isAuthenticated: false }
    }
    const parsed = JSON.parse(stored) as { user: User; token: string }
    if (parsed?.user && parsed?.token) {
      return { user: parsed.user, token: parsed.token, isAuthenticated: true }
    }
  } catch (error) {
    console.warn('Failed to load auth state', error)
  }
  return { user: null, token: null, isAuthenticated: false }
}

export const useAuthStore = create<AuthState>((set) => ({
  ...getInitialState(),
  setAuth: ({ user, token }) => {
    set({ user, token, isAuthenticated: true })
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ user, token }),
      )
    }
  },
  clearAuth: () => {
    set({ user: null, token: null, isAuthenticated: false })
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem(STORAGE_KEY)
    }
  },
}))
