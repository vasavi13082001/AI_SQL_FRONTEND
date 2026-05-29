import { createContext, useContext, useMemo, useState } from 'react'
import type { PropsWithChildren } from 'react'
import type { AuthUser, UserRole } from '../types/auth'
import { createDemoJwt, isTokenExpired, userFromToken } from '../utils/jwt'

const AUTH_STORAGE_KEY = 'auth_session'

interface AuthContextValue {
  token: string | null
  user: AuthUser | null
  isAuthenticated: boolean
  login: (email: string, password: string, role: UserRole) => void
  register: (name: string, email: string, password: string, role: UserRole) => void
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

  const startSession = (name: string, email: string, role: UserRole) => {
    const nextToken = createDemoJwt({ name, email, role })
    const nextUser = userFromToken(nextToken)

    if (!nextUser) {
      throw new Error('Unable to start authenticated session.')
    }

    localStorage.setItem(AUTH_STORAGE_KEY, nextToken)
    setToken(nextToken)
    setUser(nextUser)
  }

  const login = (email: string, _password: string, role: UserRole) => {
    const normalizedEmail = email.trim().toLowerCase()
    const fallbackName = normalizedEmail.split('@')[0] || 'user'
    const displayName = fallbackName.charAt(0).toUpperCase() + fallbackName.slice(1)

    startSession(displayName, normalizedEmail, role)
  }

  const register = (name: string, email: string, _password: string, role: UserRole) => {
    startSession(name.trim(), email.trim().toLowerCase(), role)
  }

  const logout = () => {
    localStorage.removeItem(AUTH_STORAGE_KEY)
    setToken(null)
    setUser(null)
  }

  const hasRole = (roles: UserRole[]) => {
    if (!user) {
      return false
    }

    return roles.includes(user.role)
  }

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
    [token, user],
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
