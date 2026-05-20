import React, { useState, useCallback, useMemo } from 'react'
import { Copy, Check, Zap, Trash2, Eye, EyeOff, Download } from 'lucide-react'
import { formatSQL, isValidSQL, getSQLStats, minifySQL } from '../utils/sqlFormatter'
import './SQLEditor.css'

type ViewMode = 'editor' | 'preview' | 'split'

interface SQLEditorProps {
  initialQuery?: string
  onQueryChange?: (query: string) => void
  onQuerySubmit?: (query: string) => void
  readOnly?: boolean
  height?: string
}

const SQLEditor: React.FC<SQLEditorProps> = ({
  initialQuery = '',
  onQueryChange,
  onQuerySubmit,
  readOnly = false,
  height = '400px',
}) => {
  const [query, setQuery] = useState(initialQuery)
  const [copiedToClipboard, setCopiedToClipboard] = useState(false)
  const [viewMode, setViewMode] = useState<ViewMode>('split')
  const [autoFormat, setAutoFormat] = useState(true)

  // Format query if autoFormat is enabled
  const formattedQuery = useMemo(() => {
    if (!query.trim()) return ''
    return autoFormat ? formatSQL(query) : query
  }, [query, autoFormat])

  // Get SQL stats
  const stats = useMemo(() => getSQLStats(query), [query])

  // Check if query is valid
  const isValid = useMemo(() => isValidSQL(query), [query])

  // Handle query change
  const handleQueryChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const newQuery = e.target.value
      setQuery(newQuery)
      onQueryChange?.(newQuery)
    },
    [onQueryChange]
  )

  // Copy to clipboard
  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(formattedQuery || query)
      setCopiedToClipboard(true)
      setTimeout(() => setCopiedToClipboard(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }, [formattedQuery, query])

  // Format query
  const handleFormat = useCallback(() => {
    if (query.trim()) {
      setQuery(formatSQL(query))
    }
  }, [query])

  // Clear query
  const handleClear = useCallback(() => {
    setQuery('')
    onQueryChange?.('')
  }, [onQueryChange])

  // Minify query
  const handleMinify = useCallback(() => {
    if (query.trim()) {
      setQuery(minifySQL(query))
    }
  }, [query])

  // Export query
  const handleExport = useCallback(() => {
    const element = document.createElement('a')
    const file = new Blob([formattedQuery || query], { type: 'text/sql' })
    element.href = URL.createObjectURL(file)
    element.download = 'query.sql'
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)
  }, [formattedQuery, query])

  // Highlight SQL syntax in preview
  const highlightSQL = (sql: string) => {
    if (!sql.trim()) return ''

    let highlighted = sql

    // Keywords (in order of priority)
    const keywords = [
      'SELECT', 'FROM', 'WHERE', 'AND', 'OR', 'NOT', 'IN', 'LIKE', 'BETWEEN', 'IS', 'NULL',
      'JOIN', 'INNER', 'LEFT', 'RIGHT', 'FULL', 'OUTER', 'ON', 'USING', 'CROSS',
      'GROUP', 'BY', 'HAVING', 'ORDER', 'ASC', 'DESC', 'LIMIT', 'OFFSET',
      'DISTINCT', 'ALL', 'CASE', 'WHEN', 'THEN', 'ELSE', 'END',
      'INSERT', 'INTO', 'VALUES', 'UPDATE', 'SET', 'DELETE', 'CREATE', 'TABLE', 'ALTER', 'DROP',
      'UNION', 'EXCEPT', 'INTERSECT', 'WITH', 'AS',
    ]

    keywords.forEach((keyword) => {
      const regex = new RegExp(`\\b(${keyword})\\b`, 'gi')
      highlighted = highlighted.replace(
        regex,
        '<span class="sql-keyword">$1</span>'
      )
    })

    // Strings (single and double quoted)
    highlighted = highlighted.replace(
      /('(?:[^'\\]|\\.)*'|"(?:[^"\\]|\\.)*")/g,
      '<span class="sql-string">$1</span>'
    )

    // Numbers
    highlighted = highlighted.replace(
      /\b(\d+(?:\.\d+)?)\b/g,
      '<span class="sql-number">$1</span>'
    )

    // Comments
    highlighted = highlighted.replace(
      /(--[^\n]*)/g,
      '<span class="sql-comment">$1</span>'
    )

    // Multi-line comments
    highlighted = highlighted.replace(
      /(\/\*[\s\S]*?\*\/)/g,
      '<span class="sql-comment">$1</span>'
    )

    return highlighted
  }

  return (
    <div className="sql-editor-container rounded-lg border border-gray-200 dark:border-dark-700 overflow-hidden bg-white dark:bg-dark-800 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between gap-2 border-b border-gray-200 dark:border-dark-700 bg-gray-50 dark:bg-dark-700 p-3 flex-wrap">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white">SQL Editor</h3>
          {isValid && query.trim() && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300">
              Valid
            </span>
          )}
          {query.trim() && !isValid && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-amber-100 dark:bg-amber-900 text-amber-700 dark:text-amber-300">
              Invalid
            </span>
          )}
        </div>

        {/* View Mode Toggle */}
        <div className="flex gap-1">
          <button
            onClick={() => setViewMode('editor')}
            className={`p-2 rounded text-xs transition-colors ${
              viewMode === 'editor'
                ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-dark-600'
            }`}
            title="Editor only"
          >
            <EyeOff size={16} />
          </button>
          <button
            onClick={() => setViewMode('split')}
            className={`p-2 rounded text-xs transition-colors ${
              viewMode === 'split'
                ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-dark-600'
            }`}
            title="Split view"
          >
            <Eye size={16} />
          </button>
          <button
            onClick={() => setViewMode('preview')}
            className={`p-2 rounded text-xs transition-colors ${
              viewMode === 'preview'
                ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-dark-600'
            }`}
            title="Preview only"
          >
            <Eye size={16} />
          </button>
        </div>

        {/* Auto Format Toggle */}
        <label className="flex items-center gap-2 text-xs cursor-pointer">
          <input
            type="checkbox"
            checked={autoFormat}
            onChange={(e) => setAutoFormat(e.target.checked)}
            className="w-4 h-4"
          />
          <span className="text-gray-700 dark:text-gray-300">Auto-format</span>
        </label>
      </div>

      {/* Main Content */}
      <div className={`flex ${viewMode === 'split' ? 'gap-4' : ''} overflow-hidden`} style={{ height }}>
        {/* Editor Section */}
        {(viewMode === 'editor' || viewMode === 'split') && (
          <div className="flex-1 flex flex-col min-w-0">
            <textarea
              value={query}
              onChange={handleQueryChange}
              readOnly={readOnly}
              placeholder="Enter your SQL query here..."
              className="flex-1 p-4 font-mono text-sm bg-white dark:bg-dark-800 text-gray-900 dark:text-white border-none outline-none resize-none placeholder-gray-400 dark:placeholder-gray-600"
            />
          </div>
        )}

        {/* Divider */}
        {viewMode === 'split' && <div className="w-px bg-gray-200 dark:bg-dark-700" />}

        {/* Preview Section */}
        {(viewMode === 'preview' || viewMode === 'split') && (
          <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
            <div
              className="flex-1 p-4 font-mono text-sm bg-gray-50 dark:bg-dark-700 text-gray-900 dark:text-white overflow-auto rounded-none sql-preview"
              dangerouslySetInnerHTML={{
                __html: highlightSQL(formattedQuery || query) || '<span class="text-gray-400">Preview will appear here</span>',
              }}
            />
          </div>
        )}
      </div>

      {/* Footer - Actions and Stats */}
      <div className="border-t border-gray-200 dark:border-dark-700 bg-gray-50 dark:bg-dark-700 p-3">
        {/* Stats */}
        <div className="flex gap-4 mb-3 text-xs text-gray-600 dark:text-gray-400 flex-wrap">
          <span>Lines: {stats.lines}</span>
          <span>Keywords: {stats.keywords}</span>
          <span>Tables: {stats.tables}</span>
          <span>Functions: {stats.functions}</span>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={handleCopy}
            disabled={!query.trim()}
            className="flex items-center gap-1 px-3 py-2 text-xs font-medium rounded-lg transition-colors bg-gray-200 dark:bg-dark-600 text-gray-900 dark:text-white hover:bg-gray-300 dark:hover:bg-dark-500 disabled:opacity-50 disabled:cursor-not-allowed"
            title="Copy formatted query"
          >
            {copiedToClipboard ? <Check size={14} /> : <Copy size={14} />}
            {copiedToClipboard ? 'Copied!' : 'Copy'}
          </button>

          <button
            onClick={handleFormat}
            disabled={!query.trim() || readOnly}
            className="flex items-center gap-1 px-3 py-2 text-xs font-medium rounded-lg transition-colors bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600 text-white disabled:opacity-50 disabled:cursor-not-allowed"
            title="Format query"
          >
            <Zap size={14} />
            Format
          </button>

          <button
            onClick={handleMinify}
            disabled={!query.trim() || readOnly}
            className="flex items-center gap-1 px-3 py-2 text-xs font-medium rounded-lg transition-colors bg-gray-200 dark:bg-dark-600 text-gray-900 dark:text-white hover:bg-gray-300 dark:hover:bg-dark-500 disabled:opacity-50 disabled:cursor-not-allowed"
            title="Minify query"
          >
            Minify
          </button>

          <button
            onClick={handleExport}
            disabled={!query.trim()}
            className="flex items-center gap-1 px-3 py-2 text-xs font-medium rounded-lg transition-colors bg-gray-200 dark:bg-dark-600 text-gray-900 dark:text-white hover:bg-gray-300 dark:hover:bg-dark-500 disabled:opacity-50 disabled:cursor-not-allowed"
            title="Export query as SQL file"
          >
            <Download size={14} />
            Export
          </button>

          <button
            onClick={handleClear}
            disabled={!query.trim() || readOnly}
            className="flex items-center gap-1 px-3 py-2 text-xs font-medium rounded-lg transition-colors bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-300 hover:bg-red-200 dark:hover:bg-red-800 disabled:opacity-50 disabled:cursor-not-allowed"
            title="Clear query"
          >
            <Trash2 size={14} />
            Clear
          </button>

          {onQuerySubmit && (
            <button
              onClick={() => onQuerySubmit(formattedQuery || query)}
              disabled={!isValid || !query.trim()}
              className="flex items-center gap-1 px-3 py-2 text-xs font-medium rounded-lg transition-colors bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-600 text-white disabled:opacity-50 disabled:cursor-not-allowed ml-auto"
              title="Execute query"
            >
              Execute
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default SQLEditor
