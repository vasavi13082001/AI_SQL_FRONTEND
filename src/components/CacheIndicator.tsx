import React, { useMemo } from 'react'
import { Database, Zap, AlertCircle, Clock } from 'lucide-react'

export interface CacheMetadata {
  isCached: boolean
  cacheAge?: number // milliseconds
  cacheSource?: 'local' | 'session' | 'remote' | 'optimized'
  hitRate?: number // 0-100 percentage
  size?: number // bytes
  ttl?: number // milliseconds until expiry
}

interface CacheIndicatorProps {
  metadata: CacheMetadata
  showAge?: boolean
  showHitRate?: boolean
  compact?: boolean
  className?: string
}

/**
 * CacheIndicator Component
 * Displays visual indicators for cached data with various metadata
 * 
 * @example
 * <CacheIndicator
 *   metadata={{
 *     isCached: true,
 *     cacheAge: 5000,
 *     cacheSource: 'local',
 *     hitRate: 85
 *   }}
 *   showAge
 *   showHitRate
 * />
 */
export const CacheIndicator: React.FC<CacheIndicatorProps> = ({
  metadata,
  showAge = true,
  showHitRate = true,
  compact = false,
  className = '',
}) => {
  const cacheInfo = useMemo(() => {
    if (!metadata.isCached) {
      return {
        label: 'Live Data',
        icon: 'database',
        color: 'text-blue-600 dark:text-blue-400',
        bg: 'bg-blue-50 dark:bg-blue-900/20',
        tooltip: 'Data fetched from source',
      }
    }

    const ageMs = metadata.cacheAge || 0
    const age = formatCacheAge(ageMs)

    let icon = 'zap'
    let color = 'text-green-600 dark:text-green-400'
    let bg = 'bg-green-50 dark:bg-green-900/20'

    if (ageMs > 3600000) { // 1 hour
      icon = 'clock'
      color = 'text-orange-600 dark:text-orange-400'
      bg = 'bg-orange-50 dark:bg-orange-900/20'
    } else if (ageMs > 300000) { // 5 minutes
      color = 'text-yellow-600 dark:text-yellow-400'
      bg = 'bg-yellow-50 dark:bg-yellow-900/20'
    }

    return {
      label: metadata.cacheSource === 'optimized' ? 'Optimized Cache' : 'Cached',
      sublabel: age,
      icon,
      color,
      bg,
      tooltip: `Data cached ${age}${metadata.cacheSource ? ` (${metadata.cacheSource})` : ''}`,
    }
  }, [metadata])

  const badgeContent = useMemo(() => {
    const parts = [cacheInfo.label]
    
    if (showAge && cacheInfo.sublabel) {
      parts.push(`· ${cacheInfo.sublabel}`)
    }
    
    if (showHitRate && metadata.hitRate !== undefined) {
      parts.push(`· ${metadata.hitRate}% hit`)
    }
    
    return parts.join(' ')
  }, [cacheInfo, showAge, showHitRate, metadata.hitRate])

  const IconComponent =
    cacheInfo.icon === 'database'
      ? Database
      : cacheInfo.icon === 'clock'
        ? Clock
        : cacheInfo.icon === 'zap'
          ? Zap
          : AlertCircle

  if (compact) {
    return (
      <div
        title={cacheInfo.tooltip}
        className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${cacheInfo.color} ${cacheInfo.bg} ${className}`}
      >
        <IconComponent size={12} />
        <span>{cacheInfo.label}</span>
      </div>
    )
  }

  return (
    <div
      title={cacheInfo.tooltip}
      className={`flex items-center gap-2 px-3 py-2 rounded-lg border ${cacheInfo.bg} border-opacity-30 ${className}`}
    >
      <IconComponent size={16} className={cacheInfo.color} />
      <div className="flex flex-col gap-0.5">
        <span className={`text-xs font-medium ${cacheInfo.color}`}>{badgeContent}</span>
        {metadata.ttl && (
          <span className="text-xs text-gray-500 dark:text-gray-400">
            Expires in {formatCacheAge(metadata.ttl)}
          </span>
        )}
      </div>
      {metadata.size && (
        <span className="ml-auto text-xs text-gray-500 dark:text-gray-400">
          {formatBytes(metadata.size)}
        </span>
      )}
    </div>
  )
}

/**
 * CacheBadge Component
 * Minimal badge for cache status (best for table cells or dense layouts)
 */
export const CacheBadge: React.FC<{ metadata: CacheMetadata; size?: 'sm' | 'md' }> = ({
  metadata,
  size = 'md',
}) => {
  if (!metadata.isCached) {
    return null
  }

  const sizeClass = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-sm'
  const iconSize = size === 'sm' ? 12 : 14

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 font-medium ${sizeClass}`}
      title="Cached data"
    >
      <Zap size={iconSize} />
      <span>{metadata.cacheSource === 'optimized' ? 'Optimized' : 'Cached'}</span>
    </span>
  )
}

// Utility functions
function formatCacheAge(ms: number): string {
  const seconds = Math.floor(ms / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)

  if (days > 0) return `${days}d ago`
  if (hours > 0) return `${hours}h ago`
  if (minutes > 0) return `${minutes}m ago`
  return `${seconds}s ago`
}

export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

export default CacheIndicator
