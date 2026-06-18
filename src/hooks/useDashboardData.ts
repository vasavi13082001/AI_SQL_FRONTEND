import { useCallback } from 'react'
import { analyticsService } from '../services/analyticsService'
import { useApiRequest } from './useApiRequest'
import { usePolling } from './usePolling'

export function useDashboardData(enableRealtime = false) {
  const request = useApiRequest(() => analyticsService.getDashboardAnalytics())

  const refresh = useCallback(async () => {
    await request.run()
  }, [request])

  usePolling(refresh, 30000, enableRealtime)

  return {
    ...request,
    refresh,
  }
}
