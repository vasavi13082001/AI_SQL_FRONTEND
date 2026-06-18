import { useCallback } from 'react'
import { analyticsService } from '../services/analyticsService'
import { useApiRequest } from './useApiRequest'
import { usePolling } from './usePolling'

export function useActivityMonitoring(pollIntervalMs = 15000) {
  const request = useApiRequest(() => analyticsService.getActivityMonitoring())

  const refresh = useCallback(async () => {
    await request.run()
  }, [request])

  usePolling(refresh, pollIntervalMs, true)

  return {
    ...request,
    refresh,
  }
}
