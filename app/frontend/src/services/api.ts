import axios from 'axios'
import type { ApiError } from './types'
import { useAuthStore } from '../store/useAuthStore'

const baseURL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3000/api'

export const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
})

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token
  if (token) {
    config.headers = config.headers ?? {}
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      useAuthStore.getState().clearAuth()
    }
    return Promise.reject(error)
  },
)

export const handleApiError = (error: unknown): ApiError => {
  if (axios.isAxiosError(error)) {
    const message =
      error.response?.data?.message ??
      error.message ??
      'Erro desconhecido ao comunicar com a API'
    return {
      message: Array.isArray(message) ? message.join(', ') : message,
      status: error.response?.status,
    }
  }
  return {
    message: 'Erro inesperado',
  }
}
