import { useState, useCallback, useEffect, useRef } from 'react'
import { DashboardRefreshMetadata, RefreshState, RefreshTrigger } from '../components/DashboardRefreshState'

export interface UseDashboardRefreshOptions {
  autoRefreshInterval?: number // milliseconds
  refreshTimeout?: number // milliseconds before request times out
  enableOptimization?: boolean
  optimizationThreshold?: number // number of items before optimizing
}

export interface RefreshResult {
  itemsUpdated: number
  timestamp: Date
  source: RefreshTrigger
}

/**
 * useDashboardRefresh Hook
 * Manages dashboard refresh state with auto-refresh, error handling, and optimization
 * 
 * @example
 * const {
 *   refreshState,
 *   refresh,
 *   cancel,
 *   setAutoRefresh,
 * } = useDashboardRefresh({
 *   autoRefreshInterval: 5 * 60 * 1000,
 *   enableOptimization: true
 * })
 */
export function useDashboardRefresh(
  onRefresh: () => Promise<RefreshResult>,
  options: UseDashboardRefreshOptions = {}
) {
  const {
    autoRefreshInterval = 0,
    refreshTimeout = 30000,
    enableOptimization = true,
    optimizationThreshold = 50,
  } = options

  const [refreshState, setRefreshState] = useState<DashboardRefreshMetadata>({
    state: 'idle',
    trigger: 'manual',
  })
  const [autoRefreshEnabled, setAutoRefreshEnabled] = useState(!!autoRefreshInterval)
  const abortControllerRef = useRef<AbortController | null>(null)
  const autoRefreshIntervalRef = useRef<ReturnType<typeof setInterval>>()
  const progressIntervalRef = useRef<ReturnType<typeof setInterval>>()
  const refreshHistoryRef = useRef<RefreshResult[]>([])
  const performanceMetricsRef = useRef({
    totalRefreshes: 0,
    successfulRefreshes: 0,
    failedRefreshes: 0,
    totalItemsUpdated: 0,
    averageRefreshTime: 0,
  })

  // Start refresh operation
  const refresh = useCallback(
    async (trigger: RefreshTrigger = 'manual') => {
      if (refreshState.state === 'loading') {
        console.warn('Refresh already in progress')
        return
      }

      abortControllerRef.current = new AbortController()
      const startTime = Date.now()
      let progress = 0

      setRefreshState({
        state: 'loading',
        trigger,
        progress: 0,
        lastRefreshed: new Date(),
      })

      // Simulate progress updates
      progressIntervalRef.current = setInterval(() => {
        progress = Math.min(progress + Math.random() * 30, 95)
        setRefreshState((prev) => ({
          ...prev,
          progress: Math.round(progress),
        }))
      }, 300)

      try {
        // Race between the refresh and timeout
        const refreshPromise = Promise.race([
          onRefresh(),
          new Promise<never>((_, reject) =>
            setTimeout(
              () => reject(new Error('Refresh timeout')),
              refreshTimeout
            )
          ),
        ])

        const result = await refreshPromise

        // Update metrics
        performanceMetricsRef.current.totalRefreshes++
        performanceMetricsRef.current.successfulRefreshes++
        performanceMetricsRef.current.totalItemsUpdated += result.itemsUpdated
        const refreshTime = Date.now() - startTime
        performanceMetricsRef.current.averageRefreshTime =
          (performanceMetricsRef.current.averageRefreshTime +
            refreshTime) /
          2

        // Store in history
        refreshHistoryRef.current.unshift(result)
        if (refreshHistoryRef.current.length > 50) {
          refreshHistoryRef.current.pop()
        }

        // Determine optimization level
        let optimizationLevel: 'low' | 'medium' | 'high' = 'low'
        if (enableOptimization) {
          if (result.itemsUpdated > optimizationThreshold * 2) {
            optimizationLevel = 'high'
          } else if (result.itemsUpdated > optimizationThreshold) {
            optimizationLevel = 'medium'
          }
        }

        clearInterval(progressIntervalRef.current)

        setRefreshState({
          state: 'success',
          trigger,
          lastRefreshed: new Date(),
          itemsUpdated: result.itemsUpdated,
          progress: 100,
          optimizationLevel,
        })

        // Auto-reset to idle after 3 seconds
        setTimeout(() => {
          setRefreshState((prev) => ({
            ...prev,
            state: 'idle',
            progress: undefined,
          }))
        }, 3000)
      } catch (err) {
        const error = err instanceof Error ? err.message : String(err)

        clearInterval(progressIntervalRef.current)

        performanceMetricsRef.current.totalRefreshes++
        performanceMetricsRef.current.failedRefreshes++

        setRefreshState({
          state: 'error',
          trigger,
          error,
          lastRefreshed: new Date(),
          progress: undefined,
        })

        // Auto-reset to idle after 5 seconds
        setTimeout(() => {
          setRefreshState((prev) => ({
            ...prev,
            state: 'idle',
            progress: undefined,
          }))
        }, 5000)
      } finally {
        abortControllerRef.current = null
      }
    },
    [refreshState.state, onRefresh, refreshTimeout, enableOptimization, optimizationThreshold]
  )

  // Cancel ongoing refresh
  const cancel = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
      abortControllerRef.current = null
    }

    clearInterval(progressIntervalRef.current)

    setRefreshState((prev) => ({
      ...prev,
      state: 'idle',
      progress: undefined,
    }))
  }, [])

  // Setup auto-refresh
  const setAutoRefresh = useCallback(
    (enabled: boolean, interval?: number) => {
      setAutoRefreshEnabled(enabled)

      if (autoRefreshIntervalRef.current) {
        clearInterval(autoRefreshIntervalRef.current)
      }

      if (enabled && (interval || autoRefreshInterval)) {
        autoRefreshIntervalRef.current = setInterval(() => {
          refresh('auto')
        }, interval || autoRefreshInterval)
      }
    },
    [autoRefreshInterval, refresh]
  )

  // Calculate next refresh time
  const getNextRefreshTime = useCallback((): Date | undefined => {
    if (!autoRefreshEnabled || !autoRefreshInterval) return undefined

    const nextTime = new Date()
    nextTime.setTime(
      nextTime.getTime() +
        (autoRefreshInterval -
          ((Date.now() - (refreshState.lastRefreshed?.getTime() || 0)) %
            autoRefreshInterval))
    )
    return nextTime
  }, [autoRefreshEnabled, autoRefreshInterval, refreshState.lastRefreshed])

  // Get performance metrics
  const getMetrics = useCallback(() => {
    const metrics = performanceMetricsRef.current
    return {
      ...metrics,
      successRate:
        metrics.totalRefreshes > 0
          ? (metrics.successfulRefreshes / metrics.totalRefreshes) * 100
          : 0,
      averageItemsPerRefresh:
        metrics.successfulRefreshes > 0
          ? metrics.totalItemsUpdated / metrics.successfulRefreshes
          : 0,
    }
  }, [])

  // Initialize auto-refresh if needed
  useEffect(() => {
    if (autoRefreshEnabled && autoRefreshInterval > 0) {
      setAutoRefresh(true, autoRefreshInterval)
    }

    return () => {
      if (autoRefreshIntervalRef.current) {
        clearInterval(autoRefreshIntervalRef.current)
      }
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current)
      }
    }
  }, [autoRefreshEnabled, autoRefreshInterval, setAutoRefresh])

  // Update next refresh time
  useEffect(() => {
    setRefreshState((prev) => ({
      ...prev,
      nextRefresh: getNextRefreshTime(),
    }))
  }, [refreshState.lastRefreshed, autoRefreshEnabled, autoRefreshInterval, getNextRefreshTime])

  return {
    refreshState,
    refresh,
    cancel,
    autoRefreshEnabled,
    setAutoRefresh,
    getMetrics,
    refreshHistory: refreshHistoryRef.current,
  }
}

/**
 * useMultipleRefresh Hook
 * Manage refresh state for multiple dashboard sections
 */
export function useMultipleRefresh(
  sections: Record<string, () => Promise<RefreshResult>>
) {
  const [sectionStates, setSectionStates] = useState<Record<string, DashboardRefreshMetadata>>(
    () =>
      Object.keys(sections).reduce(
        (acc, section) => {
          acc[section] = { state: 'idle', trigger: 'manual' }
          return acc
        },
        {} as Record<string, DashboardRefreshMetadata>
      )
  )

  const refreshAll = useCallback(async () => {
    const promises = Object.entries(sections).map(async ([section, refreshFn]) => {
      try {
        setSectionStates((prev) => ({
          ...prev,
          [section]: { state: 'loading', trigger: 'manual' },
        }))

        const result = await refreshFn()

        setSectionStates((prev) => ({
          ...prev,
          [section]: {
            state: 'success',
            trigger: 'manual',
            itemsUpdated: result.itemsUpdated,
            lastRefreshed: new Date(),
          },
        }))
      } catch (error) {
        setSectionStates((prev) => ({
          ...prev,
          [section]: {
            state: 'error',
            trigger: 'manual',
            error: error instanceof Error ? error.message : String(error),
            lastRefreshed: new Date(),
          },
        }))
      }
    })

    await Promise.all(promises)
  }, [sections])

  const refreshSection = useCallback(
    async (section: string) => {
      const refreshFn = sections[section]
      if (!refreshFn) return

      try {
        setSectionStates((prev) => ({
          ...prev,
          [section]: { state: 'loading', trigger: 'manual' },
        }))

        const result = await refreshFn()

        setSectionStates((prev) => ({
          ...prev,
          [section]: {
            state: 'success',
            trigger: 'manual',
            itemsUpdated: result.itemsUpdated,
            lastRefreshed: new Date(),
          },
        }))
      } catch (error) {
        setSectionStates((prev) => ({
          ...prev,
          [section]: {
            state: 'error',
            trigger: 'manual',
            error: error instanceof Error ? error.message : String(error),
            lastRefreshed: new Date(),
          },
        }))
      }
    },
    [sections]
  )

  const getOverallState = useCallback((): RefreshState => {
    const states = Object.values(sectionStates).map((s) => s.state)
    if (states.some((s) => s === 'error')) return 'error'
    if (states.some((s) => s === 'loading')) return 'loading'
    if (states.some((s) => s === 'optimizing')) return 'optimizing'
    return 'success'
  }, [sectionStates])

  return {
    sectionStates,
    refreshAll,
    refreshSection,
    getOverallState,
  }
}

export default useDashboardRefresh
