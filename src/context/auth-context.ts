import { createContext } from 'react'
import type { RegisterPayload } from '../api/auth'
import type { User } from '../types'

export interface AuthContextValue {
  user: User | null
  initializing: boolean
  login: (email: string, password: string) => Promise<User>
  register: (input: RegisterPayload) => Promise<User>
  logout: () => Promise<void>
}

export const AuthContext = createContext<AuthContextValue | null>(null)
