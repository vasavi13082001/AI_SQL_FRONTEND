import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import type { PropsWithChildren } from 'react'
import type { AuthUser, UserRole } from '../types/auth'
import { isTokenExpired, userFromToken } from '../utils/jwt'
import { AUTH_STORAGE_KEY } from '../constants/auth'
import { authService } from '../services/authService'

interface AuthContextValue {
  token: string | null
  user: AuthUser | null
  isAuthenticated: boolean
  login: (email: string, password: string, role: UserRole) => Promise<void>
  register: (name: string, email: string, password: string, role: UserRole) => Promise<void>
  logout: () => void
  hasRole: (roles: UserRole[]) => boolean
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

const getInitialSession = (): { token: string | null; user: AuthUser | null } => {
  const storedToken = localStorage.getItem(AUTH_STORAGE_KEY)

  if (!storedToken || isTokenExpired(storedToken)) {
    localStorage.removeItem(AUTH_STORAGE_KEY)
    return { token: null, user: null }
  }

  const user = userFromToken(storedToken)

  if (!user) {
    localStorage.removeItem(AUTH_STORAGE_KEY)
    return { token: null, user: null }
  }

  return { token: storedToken, user }
}

export const AuthProvider = ({ children }: PropsWithChildren) => {
  const initialSession = getInitialSession()
  const [token, setToken] = useState<string | null>(initialSession.token)
  const [user, setUser] = useState<AuthUser | null>(initialSession.user)

  const startSession = useCallback((nextToken: string, nextUser: AuthUser) => {
    localStorage.setItem(AUTH_STORAGE_KEY, nextToken)
    setToken(nextToken)
    setUser(nextUser)
  }, [])

  const login = useCallback(async (email: string, password: string, role: UserRole) => {
    const response = await authService.login({
      email: email.trim().toLowerCase(),
      password,
      role,
    })

    startSession(response.token, response.user)
  }, [startSession])

  const register = useCallback(async (name: string, email: string, password: string, role: UserRole) => {
    const response = await authService.register({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      password,
      role,
    })

    startSession(response.token, response.user)
  }, [startSession])

  const logout = useCallback(() => {
    localStorage.removeItem(AUTH_STORAGE_KEY)
    setToken(null)
    setUser(null)
  }, [])

  const hasRole = useCallback((roles: UserRole[]) => {
    if (!user) {
      return false
    }

    return roles.includes(user.role)
  }, [user])

  useEffect(() => {
    const handleUnauthorized = () => {
      logout()
    }

    window.addEventListener('auth:unauthorized', handleUnauthorized)
    return () => {
      window.removeEventListener('auth:unauthorized', handleUnauthorized)
    }
  }, [logout])

  const value = useMemo(
    () => ({
      token,
      user,
      isAuthenticated: Boolean(token && user),
      login,
      register,
      logout,
      hasRole,
    }),
    [token, user, login, register, logout, hasRole],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error('useAuth must be used within AuthProvider.')
  }

  return context
}
