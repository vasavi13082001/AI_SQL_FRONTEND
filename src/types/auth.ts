export type UserRole = 'admin' | 'analyst' | 'viewer'

export interface JwtPayload {
  sub: string
  name: string
  email: string
  role: UserRole
  iat: number
  exp: number
}

export interface AuthUser {
  id: string
  name: string
  email: string
  role: UserRole
}
