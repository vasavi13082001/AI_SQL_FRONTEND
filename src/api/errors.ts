import axios from 'axios'
import type { ApiErrorPayload } from '../types/api'

export class ApiError extends Error {
  code: string
  status?: number
  requestId?: string

  constructor(payload: ApiErrorPayload) {
    super(payload.message)
    this.name = 'ApiError'
    this.code = payload.code
    this.status = payload.status
    this.requestId = payload.requestId
  }
}

export const normalizeApiError = (error: unknown): ApiError => {
  if (error instanceof ApiError) {
    return error
  }

  if (axios.isAxiosError(error)) {
    const status = error.response?.status
    const payload = error.response?.data as Partial<ApiErrorPayload> | undefined

    return new ApiError({
      code: payload?.code || (status ? `HTTP_${status}` : 'NETWORK_ERROR'),
      message: payload?.message || error.message || 'Unexpected API error',
      details: payload?.details,
      status,
      requestId: payload?.requestId,
    })
  }

  return new ApiError({
    code: 'UNKNOWN_ERROR',
    message: error instanceof Error ? error.message : 'Unexpected error',
  })
}
