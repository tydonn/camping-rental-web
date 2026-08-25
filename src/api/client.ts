import axios, { AxiosError } from 'axios'

export const TOKEN_STORAGE_KEY = 'camping-rental-token'

export function getStoredToken(): string | null {
  return localStorage.getItem(TOKEN_STORAGE_KEY)
}

export function storeToken(token: string): void {
  localStorage.setItem(TOKEN_STORAGE_KEY, token)
}

export function clearStoredToken(): void {
  localStorage.removeItem(TOKEN_STORAGE_KEY)
}

export type ApiError = Error & {
  status: number
  message: string
  fieldErrors: Record<string, string[]>
}

export function toApiError(error: unknown): ApiError {
  const apiError = new Error('Terjadi kesalahan tak terduga.') as ApiError
  apiError.status = 0
  apiError.fieldErrors = {}

  if (error instanceof AxiosError) {
    const status = error.response?.status ?? 0
    const payload = error.response?.data as
      | { message?: string; errors?: Record<string, string[]> }
      | undefined

    apiError.status = status
    apiError.message =
      (status === 0 ? 'Tidak dapat terhubung ke server. Periksa koneksi Anda.' : undefined) ??
      payload?.message ??
      error.message
    apiError.fieldErrors = payload?.errors ?? {}
    return apiError
  }

  if (error instanceof Error) {
    apiError.message = error.message
  }
  return apiError
}

export function firstFieldErrors(error: unknown): Record<string, string> {
  const { fieldErrors } = toApiError(error)
  const result: Record<string, string> = {}
  for (const [field, messages] of Object.entries(fieldErrors)) {
    if (messages.length > 0) result[field] = messages[0]
  }
  return result
}

export const api = axios.create({
  baseURL: '/api',
  headers: { Accept: 'application/json' },
})

api.interceptors.request.use((config) => {
  const token = getStoredToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      clearStoredToken()
    }
    return Promise.reject(toApiError(error))
  },
)
