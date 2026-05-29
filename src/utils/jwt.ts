import type { AuthUser, JwtPayload, UserRole } from '../types/auth'

const encoder = new TextEncoder()
const decoder = new TextDecoder()

const toBase64Url = (value: string): string => {
  const bytes = encoder.encode(value)
  let binary = ''

  bytes.forEach((b) => {
    binary += String.fromCharCode(b)
  })

  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '')
}

const fromBase64Url = (value: string): string => {
  const normalized = value.replace(/-/g, '+').replace(/_/g, '/')
  const padding = '='.repeat((4 - (normalized.length % 4)) % 4)
  const binary = atob(normalized + padding)
  const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0))

  return decoder.decode(bytes)
}

export const decodeJwtPayload = (token: string): JwtPayload | null => {
  const tokenParts = token.split('.')

  if (tokenParts.length < 2) {
    return null
  }

  try {
    const payloadJson = fromBase64Url(tokenParts[1])
    return JSON.parse(payloadJson) as JwtPayload
  } catch {
    return null
  }
}

export const isTokenExpired = (token: string): boolean => {
  const payload = decodeJwtPayload(token)

  if (!payload) {
    return true
  }

  return payload.exp <= Math.floor(Date.now() / 1000)
}

export const userFromToken = (token: string): AuthUser | null => {
  const payload = decodeJwtPayload(token)

  if (!payload || isTokenExpired(token)) {
    return null
  }

  return {
    id: payload.sub,
    name: payload.name,
    email: payload.email,
    role: payload.role,
  }
}

interface TokenInput {
  name: string
  email: string
  role: UserRole
}

export const createDemoJwt = ({ name, email, role }: TokenInput): string => {
  const now = Math.floor(Date.now() / 1000)
  const payload: JwtPayload = {
    sub: crypto.randomUUID(),
    name,
    email,
    role,
    iat: now,
    exp: now + 60 * 60 * 8,
  }

  const header = {
    alg: 'none',
    typ: 'JWT',
  }

  return `${toBase64Url(JSON.stringify(header))}.${toBase64Url(JSON.stringify(payload))}.`
}
