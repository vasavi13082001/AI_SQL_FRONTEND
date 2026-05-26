/**
 * SQL Editor Components and Utilities
 * Central export point for all SQL editor related modules
 */

// Components
export { default as SQLEditor } from './SQLEditor'
export { default as SQLEditorDemo } from './SQLEditorDemo'

// Utilities
export { formatSQL, minifySQL, isValidSQL, getSQLStats, validateSQL } from '../utils/sqlFormatter'
export { useSQLQuery, default as useSQLQueryHook } from '../utils/useSQLQuery'

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
 * With utilities:
 *   import { formatSQL, minifySQL, isValidSQL } from './sql-editor'
 * 
 * With hook:
 *   import { useSQLQuery } from './sql-editor'
 * 
 * Demo:
 *   import { SQLEditorDemo } from './sql-editor'
 */

export { default as OptimizationInsights } from './OptimizationInsights'
