import { useCallback, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import * as authApi from '../api/auth'
import { clearStoredToken, getStoredToken, storeToken } from '../api/client'
import type { User } from '../types'
import { AuthContext } from './auth-context'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [initializing, setInitializing] = useState(() => Boolean(getStoredToken()))

  useEffect(() => {
    if (!getStoredToken()) return
    let cancelled = false
    authApi
      .fetchMe()
      .then((me) => {
        if (cancelled) return
        setUser(me)
        setInitializing(false)
      })
      .catch(() => {
        if (cancelled) return
        clearStoredToken()
        setInitializing(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  const login = useCallback(async (email: string, password: string) => {
    const response = await authApi.login({ email, password })
    storeToken(response.token)
    setUser(response.data)
    return response.data
  }, [])

  const register = useCallback(async (input: authApi.RegisterPayload) => {
    const response = await authApi.register(input)
    storeToken(response.token)
    setUser(response.data)
    return response.data
  }, [])

  const logout = useCallback(async () => {
    try {
      await authApi.logout()
    } catch {
      clearStoredToken()
    }
    clearStoredToken()
    setUser(null)
  }, [])

  const value = useMemo(
    () => ({ user, initializing, login, register, logout }),
    [user, initializing, login, register, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
