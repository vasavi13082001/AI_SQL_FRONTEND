import React, { useState } from 'react'
import { Moon, Sun } from 'lucide-react'
import AIErrorState, { AIErrorCode, AIErrorDetails } from './AIErrorState'

// ─── Sample error fixtures ──────────────────────────────────────────────────

const ERROR_FIXTURES: Record<AIErrorCode, AIErrorDetails> = {
  network: {
    code: 'network',
    title: 'Unable to reach the AI service',
    summary:
      'The request could not be completed because the connection to the AI backend was lost. This may be a transient network issue.',
    requestId: 'req-net-8f2a1c',
    sourcePrompt: 'Show me top 10 customers by revenue last quarter',
    suggestions: [
      'Check network connectivity',
      'Try a simpler query',
      'Retry in a moment',
    ],
    troubleshooting: [
      'Verify your internet connection is stable and active.',
      'Check if a VPN or firewall is blocking outbound requests.',
      'Confirm the AI service endpoint is reachable from your environment.',
      'If the problem persists, contact your IT administrator.',
    ],
    autoRetryIn: 10,
  },
  timeout: {
    code: 'timeout',
    title: 'Request exceeded the time limit',
    summary:
      'The AI engine took too long to respond. Complex queries over large datasets can trigger this. Try narrowing your date range or simplifying the question.',
    requestId: 'req-tmo-3d9b4e',
    sourcePrompt: 'Aggregate all sales transactions across every region for the past 5 years',
    retryLabel: 'Retry with timeout',
    suggestions: [
      'Narrow the date range',
      'Filter by a single region',
      'Break into smaller queries',
    ],
    troubleshooting: [
      'Reduce the scope of your query — use a shorter time window or fewer dimensions.',
      'Add explicit filters (e.g., WHERE region = \'North\') to limit data volume.',
      'Check if the data warehouse is under heavy load and try again during off-peak hours.',
      'Ask your admin to increase the query timeout limit if this happens frequently.',
    ],
  },
  rate_limit: {
    code: 'rate_limit',
    title: 'Too many requests',
    summary:
      'You\'ve exceeded the allowed number of AI requests within the current window. Your quota resets every minute.',
    requestId: 'req-rl-c12f3a',
    retryLabel: 'Retry after cooldown',
    suggestions: [
      'Wait 60 seconds',
      'Batch your questions',
      'Use saved results',
    ],
    troubleshooting: [
      'Wait for your rate limit window to reset (typically 60 seconds).',
      'Combine multiple related questions into a single, more comprehensive prompt.',
      'Use the query history panel to retrieve results from recent identical queries.',
      'Contact your admin to request a higher tier with increased rate limits.',
    ],
    severity: 'warning',
  },
  permission: {
    code: 'permission',
    title: 'You don\'t have access to this data',
    summary:
      'Your account does not have the required permissions to query the requested schema or table. Contact an administrator to request access.',
    requestId: 'req-prm-7e0a2d',
    sourcePrompt: 'Show payroll details for all employees in Q4',
    suggestions: [
      'Query a different schema',
      'Request access from admin',
      'Use public datasets',
    ],
    troubleshooting: [
      'Confirm which schemas your role has read access to in the permissions panel.',
      'Request elevated access from your workspace administrator.',
      'Ensure your session token has not expired — try logging out and back in.',
      'If recently granted access, wait a few minutes for permission propagation.',
    ],
    severity: 'critical',
  },
  schema: {
    code: 'schema',
    title: 'Table or column not found',
    summary:
      'The AI referenced a table or column that doesn\'t exist in the connected schema. The schema may have changed since the last sync.',
    requestId: 'req-sch-5b8c1f',
    sourcePrompt: 'Select customer_lifetime_value from the analytics.customers table',
    suggestions: [
      'Refresh schema metadata',
      'Check column names',
      'Use the schema explorer',
    ],
    troubleshooting: [
      'Open the Schema Explorer to verify the table and column names are correct.',
      'Trigger a schema refresh if the database was recently updated.',
      'Check whether the table was renamed, dropped, or moved to a different schema.',
      'Use backtick quoting for identifiers with special characters or reserved words.',
    ],
    severity: 'error',
  },
  parse: {
    code: 'parse',
    title: 'Could not interpret your query',
    summary:
      'The AI was unable to parse your natural-language prompt into a valid SQL query. Try rephrasing using more precise table or field names.',
    requestId: 'req-prs-2a7d9b',
    sourcePrompt: 'gimme the stuff from the big table with the numbers from last time',
    suggestions: [
      'Be more specific',
      'Name the table explicitly',
      'Use field names',
    ],
    troubleshooting: [
      'Rephrase with explicit table and column names (e.g., "from orders.line_items").',
      'Avoid ambiguous terms — specify time periods as exact dates where possible.',
      'Break complex multi-step requests into separate, simpler queries.',
      'Consult the Schema Explorer for correct entity names before re-submitting.',
    ],
  },
  unknown: {
    code: 'unknown',
    title: 'Something went wrong',
    summary:
      'An unexpected error occurred while processing your AI request. Our team has been notified. Please try again or reach out to support if the issue persists.',
    requestId: 'req-unk-9f1e6c',
    suggestions: [
      'Try again',
      'Simplify the query',
      'Contact support',
    ],
    troubleshooting: [
      'Refresh the page and try submitting your query again.',
      'Clear your browser cache if you encounter repeated failures.',
      'Check the system status page for any active incidents.',
      'If the error persists, share the Request ID with support for faster diagnosis.',
    ],
  },
}

const VARIANT_LABELS: Record<AIErrorCode, string> = {
  network: 'Network',
  timeout: 'Timeout',
  rate_limit: 'Rate Limit',
  permission: 'Permission',
  schema: 'Schema',
  parse: 'Parse',
  unknown: 'Unknown',
}

// ─── Demo Page ─────────────────────────────────────────────────────────────────

const AIErrorDemoPage: React.FC = () => {
  const [activeCode, setActiveCode] = useState<AIErrorCode | null>('unknown')
  const [isDark, setIsDark] = useState(false)
  const [lastSuggestion, setLastSuggestion] = useState<string | null>(null)
  const [retryCount, setRetryCount] = useState(0)

  const handleRetry = () => {
    setRetryCount((c) => c + 1)
  }

  const handleUseSuggestion = (suggestion: string) => {
    setLastSuggestion(suggestion)
    setActiveCode(null)
  }

  const handleDismiss = () => {
    setActiveCode(null)
    setLastSuggestion(null)
  }

  return (
    <div className={isDark ? 'dark' : ''}>
      <div className="min-h-screen bg-slate-50 dark:bg-dark-950 transition-colors duration-300 p-6 md:p-10">
        {/* Page header */}
        <div className="max-w-4xl mx-auto">
          <div className="flex items-start justify-between mb-8">
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">AI Error States</h1>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Interactive preview of all error variant styles and behaviours.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsDark((d) => !d)}
              className="inline-flex items-center gap-2 rounded-lg border border-slate-200 dark:border-dark-700 bg-white dark:bg-dark-800 px-3 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-dark-700 transition-colors"
            >
              {isDark ? <Sun size={15} /> : <Moon size={15} />}
              {isDark ? 'Light mode' : 'Dark mode'}
            </button>
          </div>

          {/* Variant selector */}
          <div className="flex flex-wrap gap-2 mb-6">
            {(Object.keys(ERROR_FIXTURES) as AIErrorCode[]).map((code) => (
              <button
                key={code}
                type="button"
                onClick={() => {
                  setActiveCode(code)
                  setLastSuggestion(null)
                  setRetryCount(0)
                }}
                className={`rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors ${
                  activeCode === code
                    ? 'border-cyan-500 bg-cyan-500 text-white'
                    : 'border-slate-200 dark:border-dark-700 bg-white dark:bg-dark-800 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-dark-600'
                }`}
              >
                {VARIANT_LABELS[code]}
              </button>
            ))}
            <button
              type="button"
              onClick={handleDismiss}
              className="rounded-full border border-slate-200 dark:border-dark-700 bg-white dark:bg-dark-800 px-3.5 py-1.5 text-sm font-medium text-slate-500 dark:text-slate-400 hover:border-slate-300 dark:hover:border-dark-600 transition-colors"
            >
              Clear
            </button>
          </div>

          {/* Live demo area */}
          {activeCode && (
            <AIErrorState
              error={ERROR_FIXTURES[activeCode]}
              onRetry={handleRetry}
              onUseSuggestion={handleUseSuggestion}
              onDismiss={handleDismiss}
              className="mt-2"
            />
          )}

          {/* Feedback strip */}
          {(retryCount > 0 || lastSuggestion) && (
            <div className="mt-4 rounded-xl border border-emerald-200 dark:border-emerald-500/30 bg-emerald-50 dark:bg-emerald-900/20 px-4 py-3 text-sm text-emerald-800 dark:text-emerald-200">
              {lastSuggestion ? (
                <>
                  Suggestion used: <strong>"{lastSuggestion}"</strong>
                </>
              ) : (
                <>
                  Retry triggered <strong>{retryCount}</strong> time{retryCount !== 1 ? 's' : ''}.
                </>
              )}
            </div>
          )}

          {/* ── All variants reference grid ── */}
          <div className="mt-12">
            <h2 className="text-base font-semibold text-slate-800 dark:text-slate-200 mb-4">
              All variants at a glance
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {(Object.keys(ERROR_FIXTURES) as AIErrorCode[]).map((code) => (
                <AIErrorState
                  key={code}
                  error={{ ...ERROR_FIXTURES[code], autoRetryIn: undefined }}
                  onRetry={() => {}}
                  onUseSuggestion={() => {}}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AIErrorDemoPage
