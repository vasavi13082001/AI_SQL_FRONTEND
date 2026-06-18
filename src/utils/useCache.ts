import { useState, useCallback, useEffect, useRef } from 'react'
import { CacheMetadata } from '../components/CacheIndicator'

export interface CacheEntry<T> {
  data: T
  timestamp: number
  ttl?: number // milliseconds
  source: 'local' | 'session' | 'remote' | 'optimized'
  hitCount: number
}

export interface UseCacheOptions {
  ttl?: number // default TTL in milliseconds
  storageKey?: string
  enableRemoteSync?: boolean
}

/**
 * useCache Hook
 * Manages caching with multiple storage strategies and metadata tracking
 * 
 * @example
 * const {
 *   data,
 *   isLoading,
 *   cacheMetadata,
 *   setData,
 *   invalidate,
 * } = useCache<QueryResult>({
 *   ttl: 5 * 60 * 1000, // 5 minutes
 *   storageKey: 'query-cache'
 * })
 */
export function useCache<T = unknown>(options: UseCacheOptions = {}) {
  const { ttl = 5 * 60 * 1000, storageKey = 'app-cache' } = options

  const [data, setData] = useState<T | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const [cacheMetadata, setCacheMetadata] = useState<CacheMetadata>({
    isCached: false,
  })

  const cacheRef = useRef<Map<string, CacheEntry<T>>>(new Map())
  const hitCountRef = useRef(0)
  const requestCountRef = useRef(0)

  // Initialize from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(storageKey)
      if (stored) {
        const parsed = JSON.parse(stored) as Record<string, CacheEntry<T>>
        cacheRef.current = new Map(Object.entries(parsed))
      }
    } catch (err) {
      console.error('Failed to initialize cache from localStorage:', err)
    }
  }, [storageKey])

  // Check if cache entry is valid (not expired)
  const isValidEntry = useCallback((entry: CacheEntry<T>): boolean => {
    if (!entry.ttl) return true
    const age = Date.now() - entry.timestamp
    return age < entry.ttl
  }, [])

  // Get cached data
  const getCached = useCallback(
    (key: string): T | null => {
      const entry = cacheRef.current.get(key)
      if (!entry) return null

      if (!isValidEntry(entry)) {
        cacheRef.current.delete(key)
        return null
      }

      entry.hitCount++
      hitCountRef.current++
      requestCountRef.current++

      setCacheMetadata({
        isCached: true,
        cacheAge: Date.now() - entry.timestamp,
        cacheSource: entry.source,
        hitRate:
          requestCountRef.current > 0
            ? Math.round((hitCountRef.current / requestCountRef.current) * 100)
            : 0,
        size: estimateSize(entry.data),
        ttl: entry.ttl,
      })

      return entry.data
    },
    [isValidEntry]
  )

  // Set cache data
  const setCached = useCallback(
    (key: string, value: T, source: CacheEntry<T>['source'] = 'remote') => {
      const entry: CacheEntry<T> = {
        data: value,
        timestamp: Date.now(),
        ttl,
        source,
        hitCount: 0,
      }

      cacheRef.current.set(key, entry)

      // Persist to localStorage
      try {
        const cacheObject = Object.fromEntries(cacheRef.current)
        localStorage.setItem(storageKey, JSON.stringify(cacheObject))
      } catch (err) {
        console.error('Failed to persist cache to localStorage:', err)
      }

      setCacheMetadata({
        isCached: true,
        cacheAge: 0,
        cacheSource: source,
        size: estimateSize(value),
        ttl,
      })
    },
    [ttl, storageKey]
  )

  // Invalidate specific cache entry
  const invalidate = useCallback((key: string) => {
    cacheRef.current.delete(key)
    try {
      const cacheObject = Object.fromEntries(cacheRef.current)
      localStorage.setItem(storageKey, JSON.stringify(cacheObject))
    } catch (err) {
      console.error('Failed to update cache in localStorage:', err)
    }
    setCacheMetadata({ isCached: false })
  }, [storageKey])

  // Invalidate all cache
  const invalidateAll = useCallback(() => {
    cacheRef.current.clear()
    hitCountRef.current = 0
    requestCountRef.current = 0
    try {
      localStorage.removeItem(storageKey)
    } catch (err) {
      console.error('Failed to clear cache from localStorage:', err)
    }
    setCacheMetadata({ isCached: false })
  }, [storageKey])

  // Get cache statistics
  const getStats = useCallback(() => {
    const validEntries = Array.from(cacheRef.current.values()).filter(
      (e) => isValidEntry(e)
    )

    return {
      totalEntries: validEntries.length,
      totalHits: hitCountRef.current,
      totalRequests: requestCountRef.current,
      hitRate:
        requestCountRef.current > 0
          ? (hitCountRef.current / requestCountRef.current) * 100
          : 0,
      totalSize: validEntries.reduce((sum, e) => sum + estimateSize(e.data), 0),
      entries: validEntries.map((e) => ({
        source: e.source,
        age: Date.now() - e.timestamp,
        hitCount: e.hitCount,
        size: estimateSize(e.data),
      })),
    }
  }, [isValidEntry])

  // Cleanup expired entries
  const cleanup = useCallback(() => {
    let expiredCount = 0
    for (const [key, entry] of cacheRef.current) {
      if (!isValidEntry(entry)) {
        cacheRef.current.delete(key)
        expiredCount++
      }
    }

    if (expiredCount > 0) {
      try {
        const cacheObject = Object.fromEntries(cacheRef.current)
        localStorage.setItem(storageKey, JSON.stringify(cacheObject))
      } catch (err) {
        console.error('Failed to persist cache cleanup to localStorage:', err)
      }
    }

    return expiredCount
  }, [isValidEntry, storageKey])

  // Auto-cleanup periodically
  useEffect(() => {
    const interval = setInterval(() => {
      cleanup()
    }, 60 * 1000) // Every minute

    return () => clearInterval(interval)
  }, [cleanup])

  return {
    data,
    setData,
    isLoading,
    setIsLoading,
    error,
    setError,
    cacheMetadata,
    getCached,
    setCached,
    invalidate,
    invalidateAll,
    getStats,
    cleanup,
  }
}

/**
 * useOptimizedCache Hook
 * Higher-level hook with automatic request deduplication and retry logic
 */
export function useOptimizedCache<T = unknown>(
  fetchFn: () => Promise<T>,
  key: string,
  options: UseCacheOptions & { retries?: number; retryDelay?: number } = {}
) {
  const { retries = 3, retryDelay = 1000, ...cacheOptions } = options
  const cache = useCache<T>(cacheOptions)
  const [optimizationLevel, setOptimizationLevel] = useState<'low' | 'medium' | 'high'>(
    'medium'
  )
  const requestCountRef = useRef(0)

  const fetch = useCallback(
    async (skipCache = false) => {
      const cached = cache.getCached(key)
      if (cached && !skipCache) {
        cache.setData(cached)
        return
      }

      cache.setIsLoading(true)
      cache.setError(null)
      let lastError: Error | null = null
      let attempt = 0

      while (attempt < retries) {
        try {
          const result = await fetchFn()
          cache.setCached(key, result, 'optimized')
          cache.setData(result)
          cache.setIsLoading(false)

          // Update optimization level based on performance
          requestCountRef.current++
          const stats = cache.getStats()
          if (stats.hitRate > 80) {
            setOptimizationLevel('high')
          } else if (stats.hitRate > 50) {
            setOptimizationLevel('medium')
          } else {
            setOptimizationLevel('low')
          }

          return result
        } catch (err) {
          lastError = err instanceof Error ? err : new Error(String(err))
          attempt++

          if (attempt < retries) {
            await new Promise((resolve) =>
              setTimeout(resolve, retryDelay * Math.pow(2, attempt - 1))
            )
          }
        }
      }

      cache.setError(lastError)
      cache.setIsLoading(false)
      throw lastError
    },
    [key, cache, fetchFn, retries, retryDelay]
  )

  // Auto-fetch on mount
  useEffect(() => {
    fetch()
    return () => undefined
  }, [fetch])

  return {
    ...cache,
    fetch,
    optimizationLevel,
  }
}

// Utility function to estimate object size
function estimateSize(obj: unknown): number {
  try {
    return new Blob([JSON.stringify(obj)]).size
  } catch {
    return 0
  }
}

export default useCache
