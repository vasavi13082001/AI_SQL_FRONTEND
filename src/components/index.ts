/**
 * SQL Editor Components and Utilities
 * Central export point for all SQL editor related modules
 */

// Components
export { default as SQLEditor } from './SQLEditor'
export { default as SQLEditorDemo } from './SQLEditorDemo'

// Cache and Refresh Indicators
export { default as CacheIndicator, CacheBadge, formatBytes } from './CacheIndicator'
export type { CacheMetadata } from './CacheIndicator'

export { default as LoadingSkeleton, SkeletonGrid, SkeletonLine, SkeletonParagraph } from './LoadingSkeleton'

export { default as DashboardRefreshState, RefreshStatusBadge, RefreshTimeline } from './DashboardRefreshState'
export type { RefreshState, RefreshTrigger, DashboardRefreshMetadata, RefreshTimelineItem } from './DashboardRefreshState'

// Utilities
export { formatSQL, minifySQL, isValidSQL, getSQLStats, validateSQL } from '../utils/sqlFormatter'
export { useSQLQuery, default as useSQLQueryHook } from '../utils/useSQLQuery'
export { useCache, useOptimizedCache } from '../utils/useCache'
export type { CacheEntry, UseCacheOptions } from '../utils/useCache'

export { useDashboardRefresh, useMultipleRefresh } from '../utils/useDashboardRefresh'
export type { UseDashboardRefreshOptions, RefreshResult } from '../utils/useDashboardRefresh'

// Types
export type { FormatterOptions, SQLValidationResult, SQLValidationBadge, SQLValidationMessage } from '../utils/sqlFormatter'

// Re-export for convenience
export type SQLEditorProps = React.ComponentProps<typeof import('./SQLEditor').default>

export const SQL_EDITOR_VERSION = '1.0.0'

/**
 * Usage examples:
 * 
 * Basic component:
 *   import { SQLEditor } from './sql-editor'
 * 
 * Cache indicators:
 *   import { CacheIndicator, useCache } from './cache'
 * 
 * Loading skeletons:
 *   import { LoadingSkeleton, SkeletonGrid } from './loading'
 * 
 * Refresh states:
 *   import { DashboardRefreshState, useDashboardRefresh } from './refresh'
 */

export { default as OptimizationInsights } from './OptimizationInsights'

// AI Error handling
export { default as AIErrorState } from './AIErrorState'
export type { AIErrorDetails, AIErrorCode, AIErrorSeverity } from './AIErrorState'
export { default as AIErrorDemoPage } from './AIErrorDemoPage'
