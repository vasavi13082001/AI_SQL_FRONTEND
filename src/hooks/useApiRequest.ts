import { useCallback, useEffect, useState } from 'react'
import { normalizeApiError } from '../api/errors'

interface UseApiRequestOptions {
  immediate?: boolean
}

export function useApiRequest<T>(requestFn: () => Promise<T>, options: UseApiRequestOptions = {}) {
  const { immediate = true } = options
  const [data, setData] = useState<T | null>(null)
  const [isLoading, setIsLoading] = useState(immediate)
  const [error, setError] = useState<string | null>(null)

  const run = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await requestFn()
      setData(response)
      return response
    } catch (error) {
      const normalized = normalizeApiError(error)
      setError(normalized.message)
      throw normalized
    } finally {
      setIsLoading(false)
    }
  }, [requestFn])

  useEffect(() => {
    if (!immediate) {
      setIsLoading(false)
      return
    }

    void run()
  }, [immediate, run])

  return {
    data,
    isLoading,
    error,
    run,
    setData,
  }
}
