import { useMemo, useState, useCallback } from 'react'
import toast from 'react-hot-toast'
import AIQueryInput from './AIQueryInput'
import SQLEditor from './SQLEditor'
import LoadingSkeleton from './LoadingSkeleton'
import VirtualizedTable from './VirtualizedTable'
import { sqlService } from '../services/sqlService'
import type { SQLExecuteResponse } from '../types/api'

const QueryWorkbench = () => {
  const [sqlText, setSqlText] = useState('')
  const [latestPrompt, setLatestPrompt] = useState('')
  const [result, setResult] = useState<SQLExecuteResponse | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [isExecuting, setIsExecuting] = useState(false)

  const promptSuggestions = useMemo(
    () => [
      'Compare weekly active users by plan tier',
      'Find failed orders in the last 24 hours',
      'Show average response time by service for today',
      'List top users by total query cost credits',
    ],
    [],
  )

  const handlePromptSubmit = useCallback(async (prompt: string) => {
    setIsGenerating(true)

    try {
      const generated = await sqlService.generate({ prompt })
      setLatestPrompt(prompt)
      setSqlText(generated.sql)
      toast.success(`Generated SQL (${Math.round(generated.confidence * 100)}% confidence)`)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to generate SQL')
    } finally {
      setIsGenerating(false)
    }
  }, [])

  const handleExecute = useCallback(async (query: string) => {
    setIsExecuting(true)

    try {
      const validation = await sqlService.validate(query)
      if (validation.status === 'invalid') {
        toast.error(validation.issues[0] || 'SQL validation failed')
        return
      }

      if (validation.status === 'warning') {
        toast((t) => (
          <span>
            {validation.issues[0] || 'Query has warnings'}
            <button
              className="ml-3 text-cyan-600"
              onClick={() => toast.dismiss(t.id)}
            >
              Ok
            </button>
          </span>
        ))
      }

      const execution = await sqlService.execute({ sql: query })
      setResult(execution)
      toast.success(`Query executed in ${execution.durationMs}ms`)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Execution failed')
    } finally {
      setIsExecuting(false)
    }
  }, [])

  return (
    <section className="card mb-6">
      <div className="mb-4">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">AI SQL Workbench</h2>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          Generate SQL from prompts, validate against backend rules, and execute with virtualized results.
        </p>
      </div>

      <AIQueryInput suggestions={promptSuggestions} onSubmit={handlePromptSubmit} />

      {latestPrompt ? (
        <div className="rounded-lg border border-cyan-200 dark:border-cyan-800 bg-cyan-50/70 dark:bg-cyan-900/20 px-3 py-2 mb-4 text-xs text-cyan-800 dark:text-cyan-200">
          Last prompt: {latestPrompt}
        </div>
      ) : null}

      <SQLEditor
        initialQuery={sqlText}
        onQueryChange={setSqlText}
        onQuerySubmit={(query) => {
          void handleExecute(query)
        }}
        height="320px"
      />

      {isGenerating || isExecuting ? (
        <div className="mt-4">
          <LoadingSkeleton type="table" count={4} />
        </div>
      ) : null}

      {result ? (
        <div className="mt-4 space-y-3">
          <div className="flex flex-wrap gap-4 text-sm text-gray-700 dark:text-gray-300">
            <p>Rows: {result.rowCount}</p>
            <p>Duration: {result.durationMs}ms</p>
            <p>Request: {result.requestId}</p>
          </div>

          <VirtualizedTable columns={result.columns} rows={result.rows} />
        </div>
      ) : null}
    </section>
  )
}

export default QueryWorkbench
