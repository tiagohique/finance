import { api } from './api'
import type { AuthResponse, User } from './types'

interface LoginPayload {
  username: string
  password: string
}

interface RegisterPayload {
  name: string
  username: string
  password: string
}

interface UpdateProfilePayload {
  name?: string
  password?: string
}

export const authService = {
  async login(payload: LoginPayload): Promise<AuthResponse> {
    const { data } = await api.post<AuthResponse>('/auth/login', payload)
    return data
  },

  async getCurrentUser(): Promise<User> {
    const { data } = await api.get<User>('/auth/me')
    return data
  },

  async register(payload: RegisterPayload): Promise<User> {
    const { data } = await api.post<User>('/users', payload)
    return data
  },

  async updateProfile(payload: UpdateProfilePayload): Promise<User> {
    const { data } = await api.put<User>('/users/me', payload)
    return data
  },

  async deleteAccount(): Promise<void> {
    await api.delete('/users/me')
  },
}
