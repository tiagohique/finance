import axios from 'axios'
import type { ApiError } from './types'

const baseURL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3000/api'

export const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
})

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
