import { apiClient } from '../api/client'
import { shouldFallbackToMock, useMockApi } from '../api/utils'
import { createDemoJwt, userFromToken } from '../utils/jwt'
import type { AuthResponse, LoginRequest, RegisterRequest } from '../types/api'

const buildMockAuthResponse = (name: string, email: string, role: RegisterRequest['role']): AuthResponse => {
  const token = createDemoJwt({ name, email, role })
  const user = userFromToken(token)

  if (!user) {
    throw new Error('Failed to build local auth session')
  }

  return { token, user }
}

export const authService = {
  async login(payload: LoginRequest): Promise<AuthResponse> {
    try {
      const { data } = await apiClient.post<AuthResponse>('/auth/login', payload)
      return data
    } catch (error) {
      if (!shouldFallbackToMock(error)) {
        throw error
      }

      const normalizedEmail = payload.email.trim().toLowerCase()
      const fallbackName = normalizedEmail.split('@')[0] || 'user'
      const displayName = fallbackName.charAt(0).toUpperCase() + fallbackName.slice(1)

      return buildMockAuthResponse(displayName, normalizedEmail, payload.role || 'viewer')
    }
  },

  async register(payload: RegisterRequest): Promise<AuthResponse> {
    try {
      const { data } = await apiClient.post<AuthResponse>('/auth/register', payload)
      return data
    } catch (error) {
      if (!shouldFallbackToMock(error)) {
        throw error
      }

      return buildMockAuthResponse(payload.name, payload.email.toLowerCase(), payload.role)
    }
  },

  async me(): Promise<AuthResponse | null> {
    try {
      const { data } = await apiClient.get<AuthResponse>('/auth/me')
      return data
    } catch (error) {
      if (useMockApi) {
        return null
      }

      throw error
    }
  },
}
