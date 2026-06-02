import React, { useMemo } from 'react'
import { useDarkMode } from '../context/DarkModeContext'

interface LoadingSkeletonProps {
  type:
    | 'card'
    | 'chart'
    | 'table'
    | 'text'
    | 'avatar'
    | 'button'
    | 'input'
    | 'list'
    | 'metric'
  count?: number
  height?: string
  width?: string
  className?: string
  animated?: boolean
}

/**
 * LoadingSkeleton Component
 * Provides skeleton loading states for various UI elements
 * 
 * @example
 * <LoadingSkeleton type="chart" height="h-64" />
 * <LoadingSkeleton type="table" count={5} />
 * <LoadingSkeleton type="card" count={3} />
 */
export const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({
  type,
  count = 1,
  height = 'h-12',
  width = 'w-full',
  className = '',
  animated = true,
}) => {
  const { isDarkMode } = useDarkMode()

  const skeletonClass = useMemo(() => {
    const base = `rounded-md ${
      isDarkMode
        ? 'bg-gray-700 dark:bg-gray-700'
        : 'bg-gray-200 dark:bg-gray-700'
    }`
    
    return animated
      ? `${base} animate-pulse`
      : base
  }, [isDarkMode, animated])

  const renderSkeleton = () => {
    switch (type) {
      case 'text':
        return Array.from({ length: count }).map((_, i) => (
          <div key={i} className={`${skeletonClass} ${height} ${width} mb-2`} />
        ))

      case 'avatar':
        return (
          <div className={`${skeletonClass} w-12 h-12 rounded-full ${className}`} />
        )

      case 'button':
        return (
          <div
            className={`${skeletonClass} h-10 w-32 rounded-lg ${className}`}
          />
        )

      case 'input':
        return (
          <div
            className={`${skeletonClass} h-10 w-full rounded-lg ${className}`}
          />
        )

      case 'card':
        return Array.from({ length: count }).map((_, i) => (
          <div
            key={i}
            className={`rounded-lg border ${
              isDarkMode ? 'border-gray-700' : 'border-gray-200'
            } p-4 mb-4 ${className}`}
          >
            <div className={`${skeletonClass} h-6 w-3/4 mb-3`} />
            <div className={`${skeletonClass} h-4 w-full mb-2`} />
            <div className={`${skeletonClass} h-4 w-5/6 mb-2`} />
            <div className={`${skeletonClass} h-4 w-4/6`} />
          </div>
        ))

      case 'chart':
        return (
          <div className={`rounded-lg border ${
            isDarkMode ? 'border-gray-700' : 'border-gray-200'
          } p-4 ${className}`}>
            {/* Chart header */}
            <div className={`${skeletonClass} h-6 w-1/4 mb-4`} />
            
            {/* Chart bars/lines */}
            <div className="flex items-end justify-around gap-2 h-64">
              {Array.from({ length: 12 }).map((_, i) => (
                <div key={i} className="flex-1 flex flex-col items-center justify-end">
                  <div
                    className={`${skeletonClass} w-full`}
                    style={{ height: `${30 + Math.random() * 70}%` }}
                  />
                </div>
              ))}
            </div>
            
            {/* Chart legend */}
            <div className="flex gap-4 justify-center mt-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className={`${skeletonClass} h-3 w-3 rounded`} />
                  <div className={`${skeletonClass} h-3 w-16`} />
                </div>
              ))}
            </div>
          </div>
        )

      case 'table':
        return (
          <div className={`rounded-lg border ${
            isDarkMode ? 'border-gray-700' : 'border-gray-200'
          } overflow-hidden ${className}`}>
            {/* Table header */}
            <div className={`${
              isDarkMode ? 'bg-gray-800' : 'bg-gray-50'
            } border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'} p-4 flex gap-4`}>
              <div className={`${skeletonClass} h-4 w-1/6`} />
              <div className={`${skeletonClass} h-4 w-1/4`} />
              <div className={`${skeletonClass} h-4 w-1/4`} />
              <div className={`${skeletonClass} h-4 w-1/6`} />
            </div>
            
            {/* Table rows */}
            {Array.from({ length: count }).map((_, i) => (
              <div
                key={i}
                className={`border-b ${
                  isDarkMode ? 'border-gray-700' : 'border-gray-200'
                } p-4 flex gap-4`}
              >
                <div className={`${skeletonClass} h-4 w-1/6`} />
                <div className={`${skeletonClass} h-4 w-1/4`} />
                <div className={`${skeletonClass} h-4 w-1/4`} />
                <div className={`${skeletonClass} h-4 w-1/6`} />
              </div>
            ))}
          </div>
        )

      case 'metric':
        return Array.from({ length: count }).map((_, i) => (
          <div key={i} className={`rounded-lg border ${
            isDarkMode ? 'border-gray-700' : 'border-gray-200'
          } p-4 mb-4 ${className}`}>
            <div className={`${skeletonClass} h-4 w-1/3 mb-2`} />
            <div className={`${skeletonClass} h-8 w-1/2`} />
          </div>
        ))

      case 'list':
        return (
          <div className={`rounded-lg border ${
            isDarkMode ? 'border-gray-700' : 'border-gray-200'
          } overflow-hidden ${className}`}>
            {Array.from({ length: count }).map((_, i) => (
              <div
                key={i}
                className={`border-b ${
                  isDarkMode ? 'border-gray-700' : 'border-gray-200'
                } p-4 flex items-center gap-3`}
              >
                <div className={`${skeletonClass} h-10 w-10 rounded-full`} />
                <div className="flex-1">
                  <div className={`${skeletonClass} h-4 w-1/3 mb-2`} />
                  <div className={`${skeletonClass} h-3 w-2/3`} />
                </div>
              </div>
            ))}
          </div>
        )

      default:
        return (
          <div className={`${skeletonClass} ${height} ${width} ${className}`} />
        )
    }
  }

  return <div>{renderSkeleton()}</div>
}

/**
 * SkeletonGrid Component
 * Grid layout skeleton for dashboard cards
 */
export const SkeletonGrid: React.FC<{ count?: number; columns?: number }> = ({
  count = 6,
  columns = 3,
}) => {
  return (
    <div className={`grid grid-cols-${columns} gap-4`}>
      {Array.from({ length: count }).map((_, i) => (
        <LoadingSkeleton key={i} type="card" />
      ))}
    </div>
  )
}

/**
 * SkeletonLine Component
 * Single animated line skeleton
 */
export const SkeletonLine: React.FC<{ width?: string; height?: string }> = ({
  width = 'w-full',
  height = 'h-4',
}) => {
  return <LoadingSkeleton type="text" height={height} width={width} />
}

/**
 * SkeletonParagraph Component
 * Multiple line skeleton for text blocks
 */
export const SkeletonParagraph: React.FC<{ lines?: number }> = ({
  lines = 3,
}) => {
  return <LoadingSkeleton type="text" count={lines} />
}

export default LoadingSkeleton
