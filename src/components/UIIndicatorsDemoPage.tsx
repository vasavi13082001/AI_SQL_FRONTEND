import React, { useMemo, useState } from 'react'
import { RefreshCw, TrendingUp, BarChart3, Users } from 'lucide-react'
import { useDarkMode } from '../context/DarkModeContext'

import {
  CacheIndicator,
  LoadingSkeleton,
  DashboardRefreshState,
  useDashboardRefresh,
} from './index'
import type {
  CacheMetadata,
  RefreshResult,
} from './index'

/**
 * UIIndicatorsDemoPage Component
 * Comprehensive demo showcasing cache indicators, loading skeletons, and refresh states
 * 
 * Features:
 * - Cache metadata display with age and hit rates
 * - Multiple skeleton loading states
 * - Dashboard refresh state management
 * - Auto-refresh capabilities
 * - Performance metrics
 */
export const UIIndicatorsDemoPage: React.FC = () => {
  const { isDarkMode } = useDarkMode()
  const [simulatedMetrics, setSimulatedMetrics] = useState<Record<string, number>>({
    users: 0,
    queries: 0,
    performance: 0,
  })

  // Simulate data fetch
  const simulateDataFetch = async (): Promise<RefreshResult> => {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 2000))

    const itemsUpdated = Math.floor(Math.random() * 100) + 10

    setSimulatedMetrics({
      users: Math.floor(Math.random() * 5000) + 1000,
      queries: Math.floor(Math.random() * 3000) + 500,
      performance: Math.floor(Math.random() * 40) + 60,
    })

    return {
      itemsUpdated,
      timestamp: new Date(),
      source: 'manual',
    }
  }

  // Dashboard refresh hook
  const { refreshState, refresh, autoRefreshEnabled, setAutoRefresh, getMetrics } =
    useDashboardRefresh(simulateDataFetch, {
      autoRefreshInterval: 10000,
      enableOptimization: true,
    })

  const cacheMetadataExample: CacheMetadata = useMemo(
    () => ({
      isCached: true,
      cacheAge: 45000,
      cacheSource: 'optimized',
      hitRate: 82,
      size: 125440,
      ttl: 280000,
    }),
    []
  )

  const metrics = getMetrics()

  return (
    <div className={`min-h-screen p-8 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <h1 className={`text-4xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            UI Indicators Demo
          </h1>
          <p className={`text-lg ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Cache responses, loading skeletons, and dashboard refresh states
          </p>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Metric Cards */}
          {[
            { label: 'Active Users', value: simulatedMetrics.users, icon: Users },
            { label: 'Queries Executed', value: simulatedMetrics.queries, icon: BarChart3 },
            { label: 'System Performance', value: `${simulatedMetrics.performance}%`, icon: TrendingUp },
          ].map((metric, idx) => (
            <div
              key={idx}
              className={`rounded-lg border p-6 ${
                isDarkMode
                  ? 'border-gray-700 bg-gray-800'
                  : 'border-gray-200 bg-white'
              }`}
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p
                    className={`text-sm font-medium ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-600'
                    }`}
                  >
                    {metric.label}
                  </p>
                  <p
                    className={`text-2xl font-bold mt-2 ${
                      isDarkMode ? 'text-white' : 'text-gray-900'
                    }`}
                  >
                    {metric.value}
                  </p>
                </div>
                <div className={`p-3 rounded-lg ${
                  isDarkMode ? 'bg-blue-900/20' : 'bg-blue-50'
                }`}>
                  <metric.icon size={24} className="text-blue-600 dark:text-blue-400" />
                </div>
              </div>

              {/* Cache indicator for each metric */}
              <CacheIndicator
                metadata={cacheMetadataExample}
                showAge
                compact
              />
            </div>
          ))}
        </div>

        {/* Refresh State Section */}
        <div
          className={`rounded-lg border p-6 mb-8 ${
            isDarkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'
          }`}
        >
          <h2
            className={`text-xl font-semibold mb-4 ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}
          >
            Dashboard Refresh Control
          </h2>

          <DashboardRefreshState
            metadata={refreshState}
            onRefresh={() => refresh('manual')}
            onCancel={() => {}}
            showDetails
          />

          <div className="grid grid-cols-2 gap-4 mt-6">
            <button
              onClick={() => setAutoRefresh(!autoRefreshEnabled)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                autoRefreshEnabled
                  ? isDarkMode
                    ? 'bg-green-900 text-green-200'
                    : 'bg-green-100 text-green-900'
                  : isDarkMode
                    ? 'bg-gray-700 text-gray-300'
                    : 'bg-gray-200 text-gray-900'
              }`}
            >
              {autoRefreshEnabled ? 'Auto-Refresh: ON' : 'Auto-Refresh: OFF'}
            </button>
            <button
              onClick={() => refresh('manual')}
              disabled={refreshState.state === 'loading'}
              className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 ${
                refreshState.state === 'loading'
                  ? isDarkMode
                    ? 'bg-gray-700 text-gray-500'
                    : 'bg-gray-200 text-gray-500'
                  : isDarkMode
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'bg-blue-500 text-white hover:bg-blue-600'
              }`}
            >
              <RefreshCw size={16} className={refreshState.state === 'loading' ? 'animate-spin' : ''} />
              {refreshState.state === 'loading' ? 'Refreshing...' : 'Refresh Now'}
            </button>
          </div>
        </div>

        {/* Performance Metrics */}
        <div
          className={`rounded-lg border p-6 mb-8 ${
            isDarkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'
          }`}
        >
          <h2
            className={`text-xl font-semibold mb-4 ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}
          >
            Performance Metrics
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              {
                label: 'Total Refreshes',
                value: metrics.totalRefreshes,
              },
              {
                label: 'Success Rate',
                value: `${Math.round(metrics.successRate)}%`,
              },
              {
                label: 'Avg Items Updated',
                value: Math.round(metrics.averageItemsPerRefresh),
              },
              {
                label: 'Avg Refresh Time',
                value: `${Math.round(metrics.averageRefreshTime)}ms`,
              },
            ].map((stat, idx) => (
              <div
                key={idx}
                className={`p-3 rounded-lg ${
                  isDarkMode ? 'bg-gray-700' : 'bg-gray-50'
                }`}
              >
                <p
                  className={`text-xs font-medium mb-1 ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}
                >
                  {stat.label}
                </p>
                <p
                  className={`text-lg font-bold ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}
                >
                  {stat.value}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Loading Skeleton Section */}
        <div
          className={`rounded-lg border p-6 mb-8 ${
            isDarkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'
          }`}
        >
          <h2
            className={`text-xl font-semibold mb-4 ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}
          >
            Loading Skeleton Examples
          </h2>

          {/* Skeleton grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p
                className={`text-sm font-medium mb-3 ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-600'
                }`}
              >
                Chart Skeleton
              </p>
              <LoadingSkeleton type="chart" />
            </div>

            <div>
              <p
                className={`text-sm font-medium mb-3 ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-600'
                }`}
              >
                Table Skeleton
              </p>
              <LoadingSkeleton type="table" count={3} />
            </div>

            <div>
              <p
                className={`text-sm font-medium mb-3 ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-600'
                }`}
              >
                Card Skeleton
              </p>
              <LoadingSkeleton type="card" count={2} />
            </div>

            <div>
              <p
                className={`text-sm font-medium mb-3 ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-600'
                }`}
              >
                List Skeleton
              </p>
              <LoadingSkeleton type="list" count={3} />
            </div>
          </div>
        </div>

        {/* Cache Indicator Examples */}
        <div
          className={`rounded-lg border p-6 ${
            isDarkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'
          }`}
        >
          <h2
            className={`text-xl font-semibold mb-4 ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}
          >
            Cache Indicator Examples
          </h2>

          <div className="space-y-4">
            {/* Live data */}
            <div>
              <p
                className={`text-sm font-medium mb-2 ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-600'
                }`}
              >
                Live Data (not cached)
              </p>
              <CacheIndicator metadata={{ isCached: false }} />
            </div>

            {/* Recently cached */}
            <div>
              <p
                className={`text-sm font-medium mb-2 ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-600'
                }`}
              >
                Recently Cached
              </p>
              <CacheIndicator
                metadata={{
                  isCached: true,
                  cacheAge: 30000,
                  cacheSource: 'local',
                  hitRate: 75,
                  size: 51200,
                  ttl: 270000,
                }}
              />
            </div>

            {/* Optimized cache */}
            <div>
              <p
                className={`text-sm font-medium mb-2 ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-600'
                }`}
              >
                Optimized Cache (high hit rate)
              </p>
              <CacheIndicator
                metadata={{
                  isCached: true,
                  cacheAge: 180000,
                  cacheSource: 'optimized',
                  hitRate: 92,
                  size: 256000,
                  ttl: 120000,
                }}
              />
            </div>

            {/* Stale cache */}
            <div>
              <p
                className={`text-sm font-medium mb-2 ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-600'
                }`}
              >
                Stale Cache (approaching expiry)
              </p>
              <CacheIndicator
                metadata={{
                  isCached: true,
                  cacheAge: 3600000,
                  cacheSource: 'remote',
                  hitRate: 45,
                  size: 102400,
                  ttl: 10000,
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default UIIndicatorsDemoPage
