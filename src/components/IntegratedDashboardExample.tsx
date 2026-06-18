import React from 'react'
import {
  RefreshCw,
  TrendingUp,
  Database,
  Zap,
} from 'lucide-react'
import { useDarkMode } from '../context/DarkModeContext'

import {
  CacheIndicator,
  CacheBadge,
  LoadingSkeleton,
  RefreshStatusBadge,
  RefreshTimeline,
  useCache,
  useMultipleRefresh,
} from './index'
import type { CacheMetadata, RefreshResult, RefreshTimelineItem } from './index'

/**
 * IntegratedDashboardExample Component
 * Real-world example showing complete integration of cache, skeleton, and refresh indicators
 */
export const IntegratedDashboardExample: React.FC = () => {
  const { isDarkMode } = useDarkMode()

  // Simulate API calls
  const fetchAnalytics = async (): Promise<RefreshResult> => {
    await new Promise((resolve) => setTimeout(resolve, 1500))
    return {
      itemsUpdated: 12,
      timestamp: new Date(),
      source: 'auto',
    }
  }

  const fetchMetrics = async (): Promise<RefreshResult> => {
    await new Promise((resolve) => setTimeout(resolve, 1000))
    return {
      itemsUpdated: 5,
      timestamp: new Date(),
      source: 'auto',
    }
  }

  const fetchPerformance = async (): Promise<RefreshResult> => {
    await new Promise((resolve) => setTimeout(resolve, 800))
    return {
      itemsUpdated: 20,
      timestamp: new Date(),
      source: 'auto',
    }
  }

  // Multiple refresh coordination
  const { sectionStates, refreshAll, refreshSection, getOverallState } =
    useMultipleRefresh({
      analytics: fetchAnalytics,
      metrics: fetchMetrics,
      performance: fetchPerformance,
    })

  // Cache management for each section
  const analyticsCache = useCache({
    ttl: 5 * 60 * 1000,
    storageKey: 'analytics-cache',
  })

  const metricsCache = useCache({
    ttl: 3 * 60 * 1000,
    storageKey: 'metrics-cache',
  })

  // Example cache metadata
  const analyticsCacheMetadata: CacheMetadata = {
    isCached: true,
    cacheAge: 45000,
    cacheSource: 'optimized',
    hitRate: 87,
    size: 256000,
    ttl: 255000,
  }

  const metricsCacheMetadata: CacheMetadata = {
    isCached: true,
    cacheAge: 120000,
    cacheSource: 'local',
    hitRate: 72,
    size: 64000,
    ttl: 60000,
  }

  // Simulate loading states
  const analyticsLoading = sectionStates.analytics.state === 'loading'
  const metricsLoading = sectionStates.metrics.state === 'loading'

  const refreshTimeline: RefreshTimelineItem[] = [
    {
      timestamp: new Date(Date.now() - 5 * 60000),
      state: 'success',
      trigger: 'auto',
      itemsUpdated: 37,
    },
    {
      timestamp: new Date(Date.now() - 10 * 60000),
      state: 'success',
      trigger: 'manual',
      itemsUpdated: 42,
    },
    {
      timestamp: new Date(Date.now() - 15 * 60000),
      state: 'success',
      trigger: 'auto',
      itemsUpdated: 35,
    },
  ]

  return (
    <div className={`min-h-screen p-6 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1
              className={`text-3xl font-bold ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}
            >
              Integrated Dashboard
            </h1>
            <p
              className={`mt-2 ${
                isDarkMode ? 'text-gray-400' : 'text-gray-600'
              }`}
            >
              Complete example with cache indicators, loading states, and refresh controls
            </p>
          </div>

          {/* Overall Refresh Status */}
          <div className="flex items-center gap-4">
            <RefreshStatusBadge metadata={{ state: getOverallState() }} />
            <button
              onClick={refreshAll}
              disabled={getOverallState() === 'loading'}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                getOverallState() === 'loading'
                  ? isDarkMode
                    ? 'bg-gray-700 text-gray-500'
                    : 'bg-gray-300 text-gray-600'
                  : isDarkMode
                    ? 'bg-blue-600 hover:bg-blue-700 text-white'
                    : 'bg-blue-500 hover:bg-blue-600 text-white'
              }`}
            >
              <RefreshCw
                size={16}
                className={getOverallState() === 'loading' ? 'animate-spin' : ''}
              />
              Refresh All
            </button>
          </div>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Analytics Card */}
          <div
            className={`rounded-lg border p-6 ${
              isDarkMode
                ? 'border-gray-700 bg-gray-800'
                : 'border-gray-200 bg-white'
            }`}
          >
            <div className="flex items-center justify-between mb-4">
              <h2
                className={`text-lg font-semibold ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}
              >
                Analytics
              </h2>
              <div className={`p-2 rounded-lg ${
                isDarkMode ? 'bg-purple-900/20' : 'bg-purple-50'
              }`}>
                <TrendingUp size={20} className="text-purple-600 dark:text-purple-400" />
              </div>
            </div>

            {analyticsLoading ? (
              <LoadingSkeleton type="metric" count={2} />
            ) : (
              <div className="space-y-3 mb-4">
                <div>
                  <p
                    className={`text-xs font-medium ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-600'
                    }`}
                  >
                    Active Sessions
                  </p>
                  <p
                    className={`text-2xl font-bold ${
                      isDarkMode ? 'text-white' : 'text-gray-900'
                    }`}
                  >
                    2,547
                  </p>
                </div>
                <div>
                  <p
                    className={`text-xs font-medium ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-600'
                    }`}
                  >
                    Avg. Duration
                  </p>
                  <p
                    className={`text-2xl font-bold ${
                      isDarkMode ? 'text-white' : 'text-gray-900'
                    }`}
                  >
                    12m 34s
                  </p>
                </div>
              </div>
            )}

            <CacheIndicator
              metadata={analyticsCacheMetadata}
              showAge
              compact
              className="mb-3"
            />

            <div className="flex gap-2">
              <button
                onClick={() => refreshSection('analytics')}
                disabled={sectionStates.analytics.state === 'loading'}
                className={`flex-1 px-3 py-2 rounded text-xs font-medium transition-colors ${
                  sectionStates.analytics.state === 'loading'
                    ? isDarkMode
                      ? 'bg-gray-700 text-gray-500'
                      : 'bg-gray-200 text-gray-600'
                    : isDarkMode
                      ? 'bg-purple-600/20 hover:bg-purple-600/30 text-purple-400'
                      : 'bg-purple-50 hover:bg-purple-100 text-purple-700'
                }`}
              >
                {sectionStates.analytics.state === 'loading' ? 'Refreshing...' : 'Refresh'}
              </button>
              <button
                onClick={() => analyticsCache.invalidateAll()}
                className={`flex-1 px-3 py-2 rounded text-xs font-medium transition-colors ${
                  isDarkMode
                    ? 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                    : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                }`}
              >
                Clear Cache
              </button>
            </div>
          </div>

          {/* Metrics Card */}
          <div
            className={`rounded-lg border p-6 ${
              isDarkMode
                ? 'border-gray-700 bg-gray-800'
                : 'border-gray-200 bg-white'
            }`}
          >
            <div className="flex items-center justify-between mb-4">
              <h2
                className={`text-lg font-semibold ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}
              >
                Metrics
              </h2>
              <div className={`p-2 rounded-lg ${
                isDarkMode ? 'bg-green-900/20' : 'bg-green-50'
              }`}>
                <Database size={20} className="text-green-600 dark:text-green-400" />
              </div>
            </div>

            {metricsLoading ? (
              <LoadingSkeleton type="metric" count={2} />
            ) : (
              <div className="space-y-3 mb-4">
                <div>
                  <p
                    className={`text-xs font-medium ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-600'
                    }`}
                  >
                    Query Count
                  </p>
                  <p
                    className={`text-2xl font-bold ${
                      isDarkMode ? 'text-white' : 'text-gray-900'
                    }`}
                  >
                    15,234
                  </p>
                </div>
                <div>
                  <p
                    className={`text-xs font-medium ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-600'
                    }`}
                  >
                    Success Rate
                  </p>
                  <p
                    className={`text-2xl font-bold ${
                      isDarkMode ? 'text-white' : 'text-gray-900'
                    }`}
                  >
                    98.5%
                  </p>
                </div>
              </div>
            )}

            <CacheIndicator
              metadata={metricsCacheMetadata}
              showAge
              compact
              className="mb-3"
            />

            <div className="flex gap-2">
              <button
                onClick={() => refreshSection('metrics')}
                disabled={sectionStates.metrics.state === 'loading'}
                className={`flex-1 px-3 py-2 rounded text-xs font-medium transition-colors ${
                  sectionStates.metrics.state === 'loading'
                    ? isDarkMode
                      ? 'bg-gray-700 text-gray-500'
                      : 'bg-gray-200 text-gray-600'
                    : isDarkMode
                      ? 'bg-green-600/20 hover:bg-green-600/30 text-green-400'
                      : 'bg-green-50 hover:bg-green-100 text-green-700'
                }`}
              >
                {sectionStates.metrics.state === 'loading' ? 'Refreshing...' : 'Refresh'}
              </button>
              <button
                onClick={() => metricsCache.invalidateAll()}
                className={`flex-1 px-3 py-2 rounded text-xs font-medium transition-colors ${
                  isDarkMode
                    ? 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                    : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                }`}
              >
                Clear Cache
              </button>
            </div>
          </div>

          {/* Performance Card */}
          <div
            className={`rounded-lg border p-6 ${
              isDarkMode
                ? 'border-gray-700 bg-gray-800'
                : 'border-gray-200 bg-white'
            }`}
          >
            <div className="flex items-center justify-between mb-4">
              <h2
                className={`text-lg font-semibold ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}
              >
                Performance
              </h2>
              <div className={`p-2 rounded-lg ${
                isDarkMode ? 'bg-orange-900/20' : 'bg-orange-50'
              }`}>
                <Zap size={20} className="text-orange-600 dark:text-orange-400" />
              </div>
            </div>

            {sectionStates.performance.state === 'loading' ? (
              <LoadingSkeleton type="metric" count={2} />
            ) : (
              <div className="space-y-3 mb-4">
                <div>
                  <p
                    className={`text-xs font-medium ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-600'
                    }`}
                  >
                    Avg Response Time
                  </p>
                  <p
                    className={`text-2xl font-bold ${
                      isDarkMode ? 'text-white' : 'text-gray-900'
                    }`}
                  >
                    245ms
                  </p>
                </div>
                <div>
                  <p
                    className={`text-xs font-medium ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-600'
                    }`}
                  >
                    System Load
                  </p>
                  <p
                    className={`text-2xl font-bold ${
                      isDarkMode ? 'text-white' : 'text-gray-900'
                    }`}
                  >
                    62%
                  </p>
                </div>
              </div>
            )}

            <CacheBadge
              metadata={{
                isCached: true,
                cacheSource: 'optimized',
              }}
            />

            <div className="flex gap-2 mt-3">
              <button
                onClick={() => refreshSection('performance')}
                disabled={sectionStates.performance.state === 'loading'}
                className={`flex-1 px-3 py-2 rounded text-xs font-medium transition-colors ${
                  sectionStates.performance.state === 'loading'
                    ? isDarkMode
                      ? 'bg-gray-700 text-gray-500'
                      : 'bg-gray-200 text-gray-600'
                    : isDarkMode
                      ? 'bg-orange-600/20 hover:bg-orange-600/30 text-orange-400'
                      : 'bg-orange-50 hover:bg-orange-100 text-orange-700'
                }`}
              >
                {sectionStates.performance.state === 'loading' ? 'Refreshing...' : 'Refresh'}
              </button>
              <button
                className={`flex-1 px-3 py-2 rounded text-xs font-medium transition-colors ${
                  isDarkMode
                    ? 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                    : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                }`}
              >
                Clear Cache
              </button>
            </div>
          </div>
        </div>

        {/* Section Status Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {Object.entries(sectionStates).map(([section, state]) => (
            <div
              key={section}
              className={`rounded-lg border p-4 ${
                isDarkMode
                  ? 'border-gray-700 bg-gray-800'
                  : 'border-gray-200 bg-white'
              }`}
            >
              <div className="flex items-center gap-2 mb-2">
                <RefreshStatusBadge metadata={state} />
                <span className={`text-sm font-semibold capitalize ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  {section}
                </span>
              </div>
              <p className={`text-xs ${
                isDarkMode ? 'text-gray-400' : 'text-gray-600'
              }`}>
                {state.state === 'success' && state.itemsUpdated && (
                  <>Updated {state.itemsUpdated} items</>
                )}
                {state.state === 'error' && (
                  <>Error: {state.error}</>
                )}
                {state.state === 'loading' && (
                  <>Refreshing data...</>
                )}
                {state.state === 'idle' && (
                  <>Ready to refresh</>
                )}
              </p>
            </div>
          ))}
        </div>

        {/* Refresh Timeline */}
        <RefreshTimeline items={refreshTimeline} />
      </div>
    </div>
  )
}

export default IntegratedDashboardExample
