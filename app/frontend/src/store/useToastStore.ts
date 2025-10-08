import { create } from 'zustand'

export type ToastIntent = 'success' | 'error' | 'info'

export interface ToastMessage {
  id: string
  intent: ToastIntent
  message: string
}

interface ToastState {
  toasts: ToastMessage[]
  push: (toast: Omit<ToastMessage, 'id'> & { id?: string }) => void
  dismiss: (id: string) => void
}

export const useToastStore = create<ToastState>((set) => ({
  toasts: [],
  push: ({ id, intent, message }) => {
    const toastId =
      id ??
      (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
        ? crypto.randomUUID()
        : Math.random().toString(36).slice(2))
    set((state) => ({
      toasts: [...state.toasts, { id: toastId, intent, message }],
    }))
    setTimeout(() => {
      set((state) => ({
        toasts: state.toasts.filter((toast) => toast.id !== toastId),
      }))
    }, 4000)
  },
  dismiss: (id) =>
    set((state) => ({
      toasts: state.toasts.filter((toast) => toast.id !== id),
    })),
}))
