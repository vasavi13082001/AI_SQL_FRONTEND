import { ApiError } from './errors'

export const useMockApi = import.meta.env.VITE_USE_MOCKS !== 'false'

export const shouldFallbackToMock = (error: unknown): boolean => {
  if (!useMockApi) {
    return false
  }

  if (error instanceof ApiError) {
    return !error.status || error.status >= 500
  }

  return true
}
