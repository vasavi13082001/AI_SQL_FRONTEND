import React, { useState } from 'react'
import SQLEditor from './SQLEditor'

/**
 * Example/Demo component showing how to use the SQLEditor component
 * This can be integrated into your dashboard or used as a standalone demo
 */
const SQLEditorDemo: React.FC = () => {
  const [lastQuery, setLastQuery] = useState<string>('')
  const [executionResult, setExecutionResult] = useState<string>('')

  // Example initial SQL query
  const exampleQuery = `SELECT
  u.id,
  u.name,
  u.email,
  COUNT(o.id) AS order_count,
  SUM(o.amount) AS total_spent
FROM users u
LEFT JOIN orders o ON u.id = o.user_id
WHERE u.created_at >= '2024-01-01'
  AND u.status = 'active'
GROUP BY u.id, u.name, u.email
HAVING COUNT(o.id) > 0
ORDER BY total_spent DESC
LIMIT 50`

  const handleQueryChange = (query: string) => {
    setLastQuery(query)
  }

  const handleQuerySubmit = (query: string) => {
    // Here you would typically send the query to your backend
    console.log('Executing query:', query)
    setExecutionResult(`Query executed successfully!\n\nQuery:\n${query}\n\nThis is a demo. Connect to your backend to see actual results.`)
  }

  return (
    <div className="p-4 lg:p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">SQL Editor Demo</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Try the SQL editor with syntax highlighting, formatting, and query execution.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* SQL Editor */}
        <div className="lg:col-span-2 card">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Write Your Query</h2>
          <SQLEditor
            initialQuery={exampleQuery}
            onQueryChange={handleQueryChange}
            onQuerySubmit={handleQuerySubmit}
            height="500px"
          />
        </div>

        {/* Results/Info Panel */}
        <div className="card flex flex-col">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Query Info</h2>

          {/* Last Query */}
          <div className="mb-6 flex-1">
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Last Query</h3>
            {lastQuery ? (
              <div className="p-3 bg-gray-50 dark:bg-dark-700 rounded-lg text-xs text-gray-600 dark:text-gray-400 font-mono overflow-auto max-h-32">
                {lastQuery}
              </div>
            ) : (
              <p className="text-xs text-gray-500 dark:text-gray-500">No query yet</p>
            )}
          </div>

          {/* Execution Result */}
          {executionResult && (
            <div className="p-3 bg-green-50 dark:bg-green-900 rounded-lg text-xs text-green-700 dark:text-green-300 font-mono overflow-auto max-h-32">
              {executionResult}
            </div>
          )}
        </div>
      </div>

      {/* Features Overview */}
      <div className="mt-8">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="card">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Syntax Highlighting</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Keywords, strings, numbers, and comments are color-coded for better readability.
            </p>
          </div>

          <div className="card">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Auto-Formatting</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Automatically format your SQL queries with proper indentation and line breaks.
            </p>
          </div>

          <div className="card">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Split View</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              View editor and formatted preview side-by-side for instant comparison.
            </p>
          </div>

          <div className="card">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Query Tools</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Copy, minify, export, and get statistics about your SQL queries.
            </p>
          </div>
        </div>
      </div>

      {/* Usage Example */}
      <div className="mt-8 card">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Usage Example</h2>
        <div className="bg-gray-50 dark:bg-dark-700 rounded-lg p-4 overflow-auto">
          <pre className="text-xs text-gray-700 dark:text-gray-300 font-mono">
            {`import SQLEditor from './components/SQLEditor'

export function MyComponent() {
  const [query, setQuery] = useState('')

  return (
    <SQLEditor
      initialQuery="SELECT * FROM users"
      onQueryChange={(q) => setQuery(q)}
      onQuerySubmit={(q) => executeQuery(q)}
      height="500px"
    />
  )
}`}
          </pre>
        </div>
      </div>
    </div>
  )
}

export default SQLEditorDemo
