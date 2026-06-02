import React, { useMemo } from 'react'
import {
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Clock,
  Zap,
  TrendingUp,
} from 'lucide-react'
import { useDarkMode } from '../context/DarkModeContext'

export type RefreshState = 'idle' | 'loading' | 'success' | 'error' | 'optimizing'
export type RefreshTrigger = 'manual' | 'auto' | 'scheduled' | 'optimized'

export interface DashboardRefreshMetadata {
  state: RefreshState
  trigger?: RefreshTrigger
  lastRefreshed?: Date
  nextRefresh?: Date
  itemsUpdated?: number
  error?: string
  progress?: number // 0-100
  optimizationLevel?: 'low' | 'medium' | 'high'
}

interface DashboardRefreshStateProps {
  metadata: DashboardRefreshMetadata
  onRefresh?: () => void
  onCancel?: () => void
  showDetails?: boolean
  compact?: boolean
  className?: string
}

/**
 * DashboardRefreshState Component
 * Displays refresh state with visual indicators and metadata
 * 
 * @example
 * <DashboardRefreshState
 *   metadata={{
 *     state: 'success',
 *     lastRefreshed: new Date(),
 *     itemsUpdated: 45,
 *     trigger: 'auto'
 *   }}
 *   onRefresh={handleRefresh}
 * />
 */
export const DashboardRefreshState: React.FC<DashboardRefreshStateProps> = ({
  metadata,
  onRefresh,
  onCancel,
  showDetails = true,
  compact = false,
  className = '',
}) => {
  const { isDarkMode } = useDarkMode()

  const stateConfig = useMemo(() => {
    const configs: Record<RefreshState, {
      icon: React.ReactNode
      color: string
      label: string
      description?: string
    }> = {
      idle: {
        icon: <Clock size={16} />,
        color: 'text-gray-600 dark:text-gray-300',
        label: 'Ready to refresh',
        description: 'Dashboard is up to date',
      },
      loading: {
        icon: <RefreshCw size={16} className="animate-spin" />,
        color: 'text-blue-600 dark:text-blue-400',
        label: 'Refreshing...',
        description: `Updating dashboard data${metadata.progress ? ` (${metadata.progress}%)` : ''}`,
      },
      success: {
        icon: <CheckCircle2 size={16} />,
        color: 'text-green-600 dark:text-green-400',
        label: 'Refreshed',
        description: `${metadata.itemsUpdated || 0} items updated`,
      },
      error: {
        icon: <AlertCircle size={16} />,
        color: 'text-red-600 dark:text-red-400',
        label: 'Error',
        description: metadata.error || 'Failed to refresh data',
      },
      optimizing: {
        icon: <Zap size={16} className="animate-pulse" />,
        color: 'text-amber-600 dark:text-amber-400',
        label: 'Optimizing...',
        description: `${metadata.optimizationLevel || 'medium'} optimization in progress`,
      },
    }

    return configs[metadata.state]
  }, [metadata])

  const triggerBadge = useMemo(() => {
    if (!metadata.trigger) return null

    const badges: Record<RefreshTrigger, { bg: string; text: string }> = {
      manual: {
        bg: isDarkMode ? 'bg-blue-900/30' : 'bg-blue-50',
        text: 'text-blue-700 dark:text-blue-300',
      },
      auto: {
        bg: isDarkMode ? 'bg-green-900/30' : 'bg-green-50',
        text: 'text-green-700 dark:text-green-300',
      },
      scheduled: {
        bg: isDarkMode ? 'bg-purple-900/30' : 'bg-purple-50',
        text: 'text-purple-700 dark:text-purple-300',
      },
      optimized: {
        bg: isDarkMode ? 'bg-amber-900/30' : 'bg-amber-50',
        text: 'text-amber-700 dark:text-amber-300',
      },
    }

    const badge = badges[metadata.trigger]
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${badge.bg} ${badge.text}`}>
        {metadata.trigger === 'optimized' && <TrendingUp size={12} />}
        {metadata.trigger.charAt(0).toUpperCase() + metadata.trigger.slice(1)}
      </span>
    )
  }, [metadata.trigger, isDarkMode])

  const timeInfo = useMemo(() => {
    const parts: string[] = []

    if (metadata.lastRefreshed) {
      parts.push(`Last: ${formatTime(metadata.lastRefreshed)}`)
    }

    if (metadata.nextRefresh) {
      parts.push(`Next: ${formatTime(metadata.nextRefresh)}`)
    }

    return parts.length > 0 ? parts.join(' • ') : null
  }, [metadata.lastRefreshed, metadata.nextRefresh])

  if (compact) {
    return (
      <div
        className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg ${
          isDarkMode ? 'bg-gray-800' : 'bg-gray-100'
        } ${className}`}
      >
        <div className={stateConfig.color}>{stateConfig.icon}</div>
        <span className="text-sm font-medium">{stateConfig.label}</span>
        {metadata.state === 'loading' && metadata.progress && (
          <span className="text-xs text-gray-500">{metadata.progress}%</span>
        )}
        {triggerBadge && <span className="ml-auto">{triggerBadge}</span>}
      </div>
    )
  }

  return (
    <div
      className={`rounded-lg border ${
        isDarkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'
      } p-4 ${className}`}
    >
      {/* Header with icon and title */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className={stateConfig.color}>{stateConfig.icon}</div>
          <div>
            <div className={`text-sm font-semibold ${stateConfig.color}`}>
              {stateConfig.label}
            </div>
            {stateConfig.description && (
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {stateConfig.description}
              </div>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {triggerBadge}
          {(onRefresh || onCancel) && (
            <div className="flex gap-1">
              {metadata.state === 'loading' && onCancel && (
                <button
                  onClick={onCancel}
                  className={`px-2 py-1 rounded text-xs font-medium ${
                    isDarkMode
                      ? 'hover:bg-gray-700 text-gray-400'
                      : 'hover:bg-gray-100 text-gray-600'
                  }`}
                >
                  Cancel
                </button>
              )}
              {metadata.state !== 'loading' && onRefresh && (
                <button
                  onClick={onRefresh}
                  className={`px-2 py-1 rounded text-xs font-medium flex items-center gap-1 ${
                    isDarkMode
                      ? 'hover:bg-gray-700 text-blue-400'
                      : 'hover:bg-blue-50 text-blue-600'
                  }`}
                >
                  <RefreshCw size={12} />
                  Refresh
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Progress bar for loading state */}
      {metadata.state === 'loading' && metadata.progress !== undefined && (
        <div className={`w-full h-1 rounded-full overflow-hidden ${
          isDarkMode ? 'bg-gray-700' : 'bg-gray-200'
        } mb-3`}>
          <div
            className="h-full bg-blue-500 transition-all duration-300"
            style={{ width: `${metadata.progress}%` }}
          />
        </div>
      )}

      {/* Details */}
      {showDetails && timeInfo && (
        <div className="text-xs text-gray-500 dark:text-gray-400 pt-2 border-t border-gray-200 dark:border-gray-700">
          {timeInfo}
        </div>
      )}
    </div>
  )
}

/**
 * RefreshStatusBadge Component
 * Compact badge for refresh status
 */
export const RefreshStatusBadge: React.FC<{ metadata: DashboardRefreshMetadata }> = ({
  metadata,
}) => {
  const { isDarkMode } = useDarkMode()

  const statusConfig: Record<RefreshState, { icon: React.ReactNode; color: string }> =
    {
      idle: {
        icon: <Clock size={12} />,
        color: isDarkMode ? 'text-gray-400' : 'text-gray-600',
      },
      loading: {
        icon: <RefreshCw size={12} className="animate-spin" />,
        color: 'text-blue-500',
      },
      success: {
        icon: <CheckCircle2 size={12} />,
        color: 'text-green-500',
      },
      error: {
        icon: <AlertCircle size={12} />,
        color: 'text-red-500',
      },
      optimizing: {
        icon: <Zap size={12} className="animate-pulse" />,
        color: 'text-amber-500',
      },
    }

  const config = statusConfig[metadata.state]

  return (
    <div className={`inline-flex items-center gap-1 ${config.color}`}>
      {config.icon}
    </div>
  )
}

/**
 * RefreshTimeline Component
 * Shows refresh history/timeline
 */
export interface RefreshTimelineItem {
  timestamp: Date
  state: RefreshState
  trigger: RefreshTrigger
  itemsUpdated?: number
  error?: string
}

export const RefreshTimeline: React.FC<{ items: RefreshTimelineItem[] }> = ({
  items,
}) => {
  const { isDarkMode } = useDarkMode()

  return (
    <div className={`space-y-3 p-4 rounded-lg border ${
      isDarkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'
    }`}>
      <h3 className="text-sm font-semibold">Refresh History</h3>
      <div className="space-y-2">
        {items.slice(0, 5).map((item, index) => (
          <div key={index} className="flex items-start gap-3 text-xs">
            <RefreshStatusBadge metadata={{ state: item.state }} />
            <div className="flex-1">
              <div className="font-medium">
                {formatTime(item.timestamp)}
              </div>
              <div className="text-gray-500 dark:text-gray-400">
                {item.trigger} refresh
                {item.state === 'success' && item.itemsUpdated && (
                  ` • ${item.itemsUpdated} items updated`
                )}
                {item.state === 'error' && item.error && (
                  ` • ${item.error}`
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// Utility functions
function formatTime(date: Date): string {
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const seconds = Math.floor(diff / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)

  if (minutes < 1) return 'just now'
  if (minutes < 60) return `${minutes}m ago`
  if (hours < 24) return `${hours}h ago`

  // For times older than 24 hours, show the full time
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

export default DashboardRefreshState
