/**
 * SQL Editor Integration Examples
 * 
 * This file contains practical examples of integrating the SQLEditor component
 * into various parts of your application.
 */

// ============================================================================
// EXAMPLE 1: Simple Query Builder
// ============================================================================
/*
import React, { useState } from 'react'
import { SQLEditor } from '@/components'

export function SimpleQueryBuilder() {
  const [query, setQuery] = useState('')

  return (
    <SQLEditor
      onQueryChange={(q) => setQuery(q)}
      height="400px"
    />
  )
}
*/

// ============================================================================
// EXAMPLE 2: Query Builder with Execution
// ============================================================================
/*
import React, { useState } from 'react'
import { SQLEditor, useSQLQuery } from '@/components'

export function QueryBuilderWithExecution() {
  const { query, setQuery, formatted, addToHistory } = useSQLQuery()
  const [results, setResults] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleExecute = async (sql: string) => {
    setLoading(true)
    setError('')
    setResults(null)

    try {
      // Add to history
      addToHistory(sql)

      // Execute query
      const response = await fetch('/api/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: sql })
      })

      if (!response.ok) throw new Error('Query execution failed')

      const data = await response.json()
      setResults(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2">
        <SQLEditor
          initialQuery={query}
          onQueryChange={(q) => setQuery(q)}
          onQuerySubmit={handleExecute}
          height="500px"
        />
      </div>

      <div className="card flex flex-col">
        <h2 className="text-lg font-semibold mb-4">Results</h2>

        {loading && <p className="text-blue-600">Executing...</p>}

        {error && (
          <div className="p-3 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 rounded">
            {error}
          </div>
        )}

        {results && (
          <div className="text-sm text-gray-600 dark:text-gray-400">
            <p className="font-semibold mb-2">
              {Array.isArray(results) ? `${results.length} rows` : 'Success'}
            </p>
            <pre className="bg-gray-100 dark:bg-dark-700 p-2 rounded overflow-auto text-xs">
              {JSON.stringify(results, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  )
}
*/

// ============================================================================
// EXAMPLE 3: Query History and Favorites
// ============================================================================
/*
import React, { useState } from 'react'
import { SQLEditor, useSQLQuery } from '@/components'
import { Star, Trash2 } from 'lucide-react'

export function QueryBuilderWithHistory() {
  const {
    query,
    setQuery,
    history,
    favorites,
    addToHistory,
    addFavorite,
    removeFavorite,
    isFavorited,
    searchHistory
  } = useSQLQuery()

  const [historyFilter, setHistoryFilter] = useState('')
  const filteredHistory = searchHistory(historyFilter)

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      <div className="lg:col-span-3">
        <SQLEditor
          initialQuery={query}
          onQueryChange={(q) => setQuery(q)}
          onQuerySubmit={(sql) => addToHistory(sql)}
          height="500px"
        />
      </div>

      <div className="space-y-4">
        {/* Favorites */}
        <div className="card">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
            Favorites ({favorites.length})
          </h3>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {favorites.map((fav) => (
              <div
                key={fav.id}
                className="p-2 bg-yellow-50 dark:bg-yellow-900 rounded text-xs cursor-pointer hover:bg-yellow-100 dark:hover:bg-yellow-800 transition-colors"
                onClick={() => setQuery(fav.query)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-yellow-900 dark:text-yellow-100 truncate">
                      {fav.label || 'Untitled'}
                    </p>
                    <p className="text-yellow-700 dark:text-yellow-300 truncate">
                      {fav.query.substring(0, 40)}...
                    </p>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      removeFavorite(fav.id)
                    }}
                    className="text-yellow-600 dark:text-yellow-400 hover:text-yellow-700"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* History */}
        <div className="card">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
            History ({history.length})
          </h3>
          <input
            type="text"
            placeholder="Search..."
            value={historyFilter}
            onChange={(e) => setHistoryFilter(e.target.value)}
            className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-dark-600 rounded mb-2 bg-white dark:bg-dark-800 text-gray-900 dark:text-white"
          />
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {filteredHistory.map((item) => (
              <div
                key={item.id}
                className="p-2 bg-gray-100 dark:bg-dark-600 rounded text-xs cursor-pointer hover:bg-gray-200 dark:hover:bg-dark-500 transition-colors"
                onClick={() => setQuery(item.query)}
              >
                <div className="flex items-start justify-between">
                  <p className="text-gray-600 dark:text-gray-300 truncate flex-1">
                    {item.query.substring(0, 40)}...
                  </p>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      addFavorite(item.query, item.label)
                    }}
                    className={`ml-1 ${isFavorited ? 'text-yellow-500' : 'text-gray-400'}`}
                  >
                    <Star size={14} fill={isFavorited ? 'currentColor' : 'none'} />
                  </button>
                </div>
                <p className="text-gray-500 dark:text-gray-400 text-xs mt-1">
                  {new Date(item.timestamp).toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
*/

// ============================================================================
// EXAMPLE 4: Dashboard Integration
// ============================================================================
/*
import React, { useState } from 'react'
import { SQLEditor } from '@/components'
import { Dashboard } from './Dashboard'

export function DashboardWithQueryBuilder() {
  const [showQueryBuilder, setShowQueryBuilder] = useState(false)

  return (
    <div className="space-y-6">
      {showQueryBuilder && (
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">Query Builder</h2>
            <button
              onClick={() => setShowQueryBuilder(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              ×
            </button>
          </div>
          <SQLEditor height="500px" />
        </div>
      )}

      <button
        onClick={() => setShowQueryBuilder(!showQueryBuilder)}
        className="px-4 py-2 bg-blue-600 text-white rounded"
      >
        {showQueryBuilder ? 'Hide' : 'Show'} Query Builder
      </button>

      <Dashboard />
    </div>
  )
}
*/

// ============================================================================
// EXAMPLE 5: Modal Query Editor
// ============================================================================
/*
import React, { useState } from 'react'
import { SQLEditor } from '@/components'

export function ModalQueryEditor({ isOpen, onClose, onSubmit }) {
  const [query, setQuery] = useState('')

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-dark-800 rounded-lg w-11/12 h-4/5 max-w-4xl flex flex-col">
        <div className="p-4 border-b border-gray-200 dark:border-dark-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            Edit Query
          </h2>
        </div>

        <div className="flex-1 overflow-auto">
          <SQLEditor
            initialQuery={query}
            onQueryChange={(q) => setQuery(q)}
            height="100%"
          />
        </div>

        <div className="p-4 border-t border-gray-200 dark:border-dark-700 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-700 rounded"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              onSubmit(query)
              onClose()
            }}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded"
          >
            Submit
          </button>
        </div>
      </div>
    </div>
  )
}
*/

// ============================================================================
// EXAMPLE 6: Real-time Query Stats and Preview
// ============================================================================
/*
import React, { useState, useMemo } from 'react'
import { SQLEditor, getSQLStats, formatSQL } from '@/components'

export function QueryAnalyzer() {
  const [query, setQuery] = useState('')

  const stats = useMemo(() => getSQLStats(query), [query])
  const formatted = useMemo(() => formatSQL(query), [query])

  return (
    <div className="space-y-4">
      <SQLEditor
        initialQuery={query}
        onQueryChange={(q) => setQuery(q)}
        height="400px"
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="card text-center">
          <div className="text-2xl font-bold text-blue-600">{stats.lines}</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Lines</div>
        </div>
        <div className="card text-center">
          <div className="text-2xl font-bold text-green-600">{stats.keywords}</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Keywords</div>
        </div>
        <div className="card text-center">
          <div className="text-2xl font-bold text-purple-600">{stats.tables}</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Tables</div>
        </div>
        <div className="card text-center">
          <div className="text-2xl font-bold text-orange-600">{stats.functions}</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Functions</div>
        </div>
      </div>

      {formatted && (
        <div className="card">
          <h3 className="font-semibold mb-2">Formatted Query</h3>
          <pre className="bg-gray-100 dark:bg-dark-700 p-3 rounded text-xs overflow-auto">
            {formatted}
          </pre>
        </div>
      )}
    </div>
  )
}
*/

export const INTEGRATION_EXAMPLES = {
  SIMPLE_QUERY_BUILDER: 'SimpleQueryBuilder',
  QUERY_BUILDER_WITH_EXECUTION: 'QueryBuilderWithExecution',
  QUERY_BUILDER_WITH_HISTORY: 'QueryBuilderWithHistory',
  DASHBOARD_INTEGRATION: 'DashboardWithQueryBuilder',
  MODAL_QUERY_EDITOR: 'ModalQueryEditor',
  QUERY_ANALYZER: 'QueryAnalyzer',
}
