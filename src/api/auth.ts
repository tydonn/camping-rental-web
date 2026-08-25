import { api } from './client'
import type { User } from '../types'

export interface LoginPayload {
  email: string
  password: string
}

export interface RegisterPayload {
  name: string
  email: string
  password: string
  password_confirmation: string
}

interface AuthResponse {
  data: User
  token: string
}

export async function login(payload: LoginPayload): Promise<AuthResponse> {
  const response = await api.post<AuthResponse>('/login', payload)
  return response.data
}

export async function register(payload: RegisterPayload): Promise<AuthResponse> {
  const response = await api.post<AuthResponse>('/register', payload)
  return response.data
}

export async function fetchMe(): Promise<User> {
  const response = await api.get<{ data: User }>('/me')
  return response.data.data
}

export async function logout(): Promise<void> {
  await api.post('/logout')
}
