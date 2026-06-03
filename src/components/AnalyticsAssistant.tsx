import React, { useEffect, useMemo, useRef, useState } from 'react'
import { Bot, Copy, Loader2, Send, Sparkles, User2 } from 'lucide-react'
import { formatSQL } from '../utils/sqlFormatter'
import AIErrorState, { AIErrorDetails } from './AIErrorState'

type SQLPreview = {
  id: string
  title: string
  rationale: string
  sql: string
}

type AssistantMessage = {
  id: string
  role: 'user' | 'assistant'
  text: string
  renderedText: string
  isStreaming?: boolean
  previews?: SQLPreview[]
  error?: AIErrorDetails
}

type AIErrorCode = AIErrorDetails['code']

class AIServiceError extends Error {
  code: AIErrorCode

  constructor(code: AIErrorCode, message: string) {
    super(message)
    this.name = 'AIServiceError'
    this.code = code
  }
}

const starterPrompts = [
  'Compare revenue by plan tier for the last 6 months',
  'Find churn risk users with 30 days inactivity',
  'Show conversion funnel drop-off by step this week',
  'List top failing API endpoints in the last 24h',
  'Simulate timeout error for retry demo',
]

const detectPromptFailureMode = (prompt: string): AIErrorCode | null => {
  const lowered = prompt.toLowerCase()

  if (!lowered.includes('simulate') && !lowered.includes('demo error')) {
    return null
  }

  if (lowered.includes('network')) {
    return 'network'
  }

  if (lowered.includes('rate')) {
    return 'rate_limit'
  }

  if (lowered.includes('permission') || lowered.includes('access')) {
    return 'permission'
  }

  if (lowered.includes('schema') || lowered.includes('column')) {
    return 'schema'
  }

  if (lowered.includes('timeout') || lowered.includes('slow')) {
    return 'timeout'
  }

  return 'unknown'
}

const buildErrorDetails = (code: AIErrorCode, prompt: string): AIErrorDetails => {
  const requestId = `req-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`

  const defaults = {
    requestId,
    sourcePrompt: prompt,
    retryLabel: 'Retry request',
  }

  if (code === 'timeout') {
    return {
      ...defaults,
      code,
      title: 'The AI service timed out before finishing the query plan.',
      summary: 'Your request is valid, but the response window closed while building SQL alternatives.',
      suggestions: [
        'Show revenue trend by month only for the last 90 days',
        'List top 10 segments by conversion rate this week',
      ],
      troubleshooting: [
        'Reduce scope first: shorter date ranges and fewer grouping columns usually return faster.',
        'Run once with a single KPI, then ask follow-up prompts for segmentation.',
        'If retries keep failing, check warehouse workload and API latency from ops dashboards.',
      ],
    }
  }

  if (code === 'network') {
    return {
      ...defaults,
      code,
      title: 'Connection lost while reaching the AI inference endpoint.',
      summary: 'The request never fully reached the service due to an interrupted network path.',
      suggestions: [
        'Summarize yesterday signups and paid conversions',
        'Compare weekly active users for mobile vs web',
      ],
      troubleshooting: [
        'Verify VPN, proxy, or corporate gateway connectivity for outbound AI traffic.',
        'Retry once from a stable connection before changing your prompt.',
        'If available, switch to a backup API region and try again.',
      ],
    }
  }

  if (code === 'rate_limit') {
    return {
      ...defaults,
      code,
      title: 'Too many AI requests were sent in a short interval.',
      summary: 'The provider throttled this request to protect service capacity.',
      suggestions: [
        'Create a single SQL for retention by cohort month',
        'Find checkout drop-off between step 2 and step 3',
      ],
      troubleshooting: [
        'Wait 15 to 30 seconds, then retry the same prompt.',
        'Consolidate repeated exploratory prompts into one broader request.',
        'Consider queueing or client-side debouncing if multiple users share this dashboard.',
      ],
    }
  }

  if (code === 'permission') {
    return {
      ...defaults,
      code,
      title: 'The assistant does not have permission for this data context.',
      summary: 'Access controls blocked one or more datasets needed to compile the response.',
      suggestions: [
        'Query allowed datasets for weekly product usage summary',
        'Generate SQL for public analytics schema only',
      ],
      troubleshooting: [
        'Confirm role mappings and dataset grants for the current account.',
        'Try a prompt that targets known shared schemas first.',
        'Request temporary access elevation if this is a legitimate analysis task.',
      ],
    }
  }

  if (code === 'schema') {
    return {
      ...defaults,
      code,
      title: 'Schema validation failed while composing SQL.',
      summary: 'The prompt references fields that do not match the currently known metadata.',
      suggestions: [
        'Use only columns from analytics.session_facts table',
        'Show available event metrics with daily counts',
      ],
      troubleshooting: [
        'Double-check table and column names against the metadata explorer.',
        'Ask for a narrower query using one table before introducing joins.',
        'Refresh schema cache if columns were recently added or renamed.',
      ],
    }
  }

  return {
    ...defaults,
    code: 'unknown',
    title: 'An unexpected AI processing error occurred.',
    summary: 'The assistant hit an internal issue while preparing SQL options.',
    suggestions: [
      'Generate a daily KPI trend for the last 14 days',
      'Break down conversion rate by customer segment',
    ],
    troubleshooting: [
      'Retry once to rule out transient service instability.',
      'Simplify prompt wording and remove optional constraints.',
      'Escalate with the Request ID if the same issue repeats.',
    ],
  }
}

const buildSQLPreviews = (prompt: string): SQLPreview[] => {
  const lowered = prompt.toLowerCase()

  if (lowered.includes('revenue') || lowered.includes('plan')) {
    return [
      {
        id: 'rev-by-plan',
        title: 'Revenue by Plan Tier',
        rationale: 'Aggregates billed revenue monthly so trends by subscription plan are easy to compare.',
        sql: formatSQL(`
SELECT DATE_TRUNC('month', invoice_date) AS month,
       plan_tier,
       SUM(amount_usd) AS total_revenue
FROM billing.invoices
WHERE invoice_date >= DATE_TRUNC('month', CURRENT_DATE) - INTERVAL '6 months'
  AND invoice_status = 'paid'
GROUP BY month, plan_tier
ORDER BY month, total_revenue DESC;
`),
      },
      {
        id: 'rev-growth',
        title: 'Plan Revenue Growth Rate',
        rationale: 'Adds month-over-month growth to reveal acceleration and contraction by plan tier.',
        sql: formatSQL(`
WITH monthly_revenue AS (
  SELECT DATE_TRUNC('month', invoice_date) AS month,
         plan_tier,
         SUM(amount_usd) AS revenue
  FROM billing.invoices
  WHERE invoice_date >= DATE_TRUNC('month', CURRENT_DATE) - INTERVAL '12 months'
    AND invoice_status = 'paid'
  GROUP BY month, plan_tier
)
SELECT month,
       plan_tier,
       revenue,
       LAG(revenue) OVER (PARTITION BY plan_tier ORDER BY month) AS prior_month_revenue,
       ROUND(
         100.0 * (revenue - LAG(revenue) OVER (PARTITION BY plan_tier ORDER BY month))
         / NULLIF(LAG(revenue) OVER (PARTITION BY plan_tier ORDER BY month), 0),
         2
       ) AS mom_growth_pct
FROM monthly_revenue
ORDER BY month DESC, plan_tier;
`),
      },
    ]
  }

  if (lowered.includes('churn') || lowered.includes('inactive')) {
    return [
      {
        id: 'churn-risk',
        title: 'Potential Churn Cohort',
        rationale: 'Surfaces active subscriptions with low engagement and no recent sessions.',
        sql: formatSQL(`
SELECT u.user_id,
       u.email,
       s.plan_tier,
       MAX(se.started_at) AS last_session_at,
       DATE_PART('day', CURRENT_DATE - MAX(se.started_at)::date) AS inactive_days
FROM app.users u
JOIN billing.subscriptions s ON s.user_id = u.user_id
LEFT JOIN analytics.sessions se ON se.user_id = u.user_id
WHERE s.status = 'active'
GROUP BY u.user_id, u.email, s.plan_tier
HAVING MAX(se.started_at) < CURRENT_DATE - INTERVAL '30 days'
ORDER BY inactive_days DESC
LIMIT 250;
`),
      },
      {
        id: 'churn-score',
        title: 'Risk Score Distribution',
        rationale: 'Bucketing by inactivity and recent support sentiment helps prioritize retention work.',
        sql: formatSQL(`
WITH user_activity AS (
  SELECT u.user_id,
         DATE_PART('day', CURRENT_DATE - MAX(se.started_at)::date) AS inactive_days,
         COALESCE(AVG(cs.sentiment_score), 0) AS avg_sentiment
  FROM app.users u
  LEFT JOIN analytics.sessions se ON se.user_id = u.user_id
  LEFT JOIN support.conversations cs ON cs.user_id = u.user_id
    AND cs.created_at >= CURRENT_DATE - INTERVAL '60 days'
  GROUP BY u.user_id
)
SELECT CASE
         WHEN inactive_days >= 45 OR avg_sentiment < -0.2 THEN 'high'
         WHEN inactive_days >= 30 THEN 'medium'
         ELSE 'low'
       END AS churn_risk,
       COUNT(*) AS users
FROM user_activity
GROUP BY churn_risk
ORDER BY users DESC;
`),
      },
    ]
  }

  return [
    {
      id: 'generic-trend',
      title: 'KPI Trend Builder',
      rationale: 'A flexible scaffold for charting a KPI over time with safe grouping defaults.',
      sql: formatSQL(`
SELECT DATE_TRUNC('day', event_time) AS day,
       metric_name,
       COUNT(*) AS metric_value
FROM analytics.events
WHERE event_time >= CURRENT_DATE - INTERVAL '30 days'
  AND metric_name IN ('signup', 'checkout', 'activation')
GROUP BY day, metric_name
ORDER BY day ASC;
`),
    },
    {
      id: 'generic-segment',
      title: 'Segment Comparison',
      rationale: 'Compares core conversion metrics across segments to highlight outliers quickly.',
      sql: formatSQL(`
SELECT segment,
       COUNT(*) AS sessions,
       SUM(CASE WHEN converted THEN 1 ELSE 0 END) AS conversions,
       ROUND(100.0 * SUM(CASE WHEN converted THEN 1 ELSE 0 END) / NULLIF(COUNT(*), 0), 2) AS conversion_rate_pct
FROM analytics.session_facts
WHERE session_start >= CURRENT_DATE - INTERVAL '14 days'
GROUP BY segment
ORDER BY conversion_rate_pct DESC;
`),
    },
  ]
}

const buildAssistantNarrative = (prompt: string, previews: SQLPreview[]) => {
  return [
    `Analyzed your analytics request: "${prompt}".`,
    'I drafted SQL options with different trade-offs so you can choose between a quick snapshot and deeper diagnostics.',
    `Preview 1 focuses on ${previews[0]?.title.toLowerCase() || 'core trend analysis'}, while Preview 2 broadens the investigation for follow-up questions.`,
    'If you want, I can adapt either query to a specific warehouse dialect (PostgreSQL, Snowflake, BigQuery, or Redshift).',
  ].join(' ')
}

const AnalyticsAssistant: React.FC = () => {
  const [input, setInput] = useState('')
  const [isThinking, setIsThinking] = useState(false)
  const [retryPrompt, setRetryPrompt] = useState<string | null>(null)
  const [messages, setMessages] = useState<AssistantMessage[]>([
    {
      id: 'intro-assistant',
      role: 'assistant',
      text: 'I can help you explore metrics, generate SQL, and explain the trade-offs before execution. Ask for a KPI, cohort, anomaly, or funnel breakdown.',
      renderedText: 'I can help you explore metrics, generate SQL, and explain the trade-offs before execution. Ask for a KPI, cohort, anomaly, or funnel breakdown.',
      previews: buildSQLPreviews('starter analytics prompt'),
    },
  ])

  const streamTimerRef = useRef<number | null>(null)
  const scrollAnchorRef = useRef<HTMLDivElement | null>(null)
  const simulatedFailureAttemptsRef = useRef<Record<string, number>>({})

  const canSend = input.trim().length > 0 && !isThinking

  const suggestionChips = useMemo(() => starterPrompts, [])

  useEffect(() => {
    scrollAnchorRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    return () => {
      if (streamTimerRef.current) {
        window.clearInterval(streamTimerRef.current)
      }
    }
  }, [])

  const copySQL = async (sql: string) => {
    try {
      await navigator.clipboard.writeText(sql)
    } catch {
      // Clipboard write failures are non-critical for this UI.
    }
  }

  const submitPrompt = async (promptText: string, options?: { isRetry?: boolean }) => {
    const prompt = promptText.trim()
    if (!prompt || isThinking) {
      return
    }

    if (streamTimerRef.current) {
      window.clearInterval(streamTimerRef.current)
      streamTimerRef.current = null
    }

    const shouldAppendUserMessage = !options?.isRetry

    const userMessage: AssistantMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      text: prompt,
      renderedText: prompt,
    }

    setIsThinking(true)

    try {
      await new Promise((resolve) => setTimeout(resolve, 220))

      const simulatedErrorCode = detectPromptFailureMode(prompt)
      const normalizedPromptKey = prompt.toLowerCase()
      const previousFailureCount = simulatedFailureAttemptsRef.current[normalizedPromptKey] || 0

      if (simulatedErrorCode && previousFailureCount < 1) {
        simulatedFailureAttemptsRef.current[normalizedPromptKey] = previousFailureCount + 1
        throw new AIServiceError(simulatedErrorCode, `Simulated ${simulatedErrorCode} failure`)
      }

      const previews = buildSQLPreviews(prompt)
      const assistantText = buildAssistantNarrative(prompt, previews)
      const assistantId = `assistant-${Date.now()}-${Math.random().toString(16).slice(2)}`

      const assistantMessage: AssistantMessage = {
        id: assistantId,
        role: 'assistant',
        text: assistantText,
        renderedText: '',
        isStreaming: true,
        previews,
      }

      setInput('')
      setRetryPrompt(null)
      setMessages((previous) =>
        shouldAppendUserMessage ? [...previous, userMessage, assistantMessage] : [...previous, assistantMessage],
      )

      let cursor = 0
      streamTimerRef.current = window.setInterval(() => {
        cursor += 3
        setMessages((previous) =>
          previous.map((message) => {
            if (message.id !== assistantId) {
              return message
            }

            const nextSlice = assistantText.slice(0, cursor)
            const streamingComplete = nextSlice.length >= assistantText.length

            return {
              ...message,
              renderedText: nextSlice,
              isStreaming: !streamingComplete,
            }
          }),
        )

        if (cursor >= assistantText.length && streamTimerRef.current) {
          window.clearInterval(streamTimerRef.current)
          streamTimerRef.current = null
          setIsThinking(false)
        }
      }, 24)
    } catch (error) {
      const code = error instanceof AIServiceError ? error.code : 'unknown'
      const details = buildErrorDetails(code, prompt)

      const errorMessage: AssistantMessage = {
        id: `assistant-error-${Date.now()}-${Math.random().toString(16).slice(2)}`,
        role: 'assistant',
        text: details.summary,
        renderedText: details.summary,
        error: details,
      }

      setRetryPrompt(prompt)
      setMessages((previous) =>
        shouldAppendUserMessage ? [...previous, userMessage, errorMessage] : [...previous, errorMessage],
      )
      setIsThinking(false)
    }
  }

  return (
    <section className="assistant-atmosphere min-h-[calc(100vh-4rem)] px-4 py-4 lg:px-8 lg:py-7">
      <div className="mx-auto w-full max-w-5xl">
        <header className="assistant-shell mb-4 lg:mb-6 p-4 lg:p-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Analytics Copilot</h1>
              <p className="text-sm lg:text-base text-slate-600 dark:text-slate-300 mt-2 max-w-2xl">
                Chat-style analyst experience with streaming answers and generated SQL previews before execution.
              </p>
            </div>
            <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 dark:bg-dark-700 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200">
              <Sparkles size={14} />
              AI mode
            </div>
          </div>
        </header>

        <div className="assistant-shell overflow-hidden">
          <div className="h-[60vh] overflow-y-auto p-4 lg:p-6 space-y-5">
            {messages.map((message) => {
              const isAssistant = message.role === 'assistant'

              return (
                <article
                  key={message.id}
                  className={`assistant-message-row ${isAssistant ? 'justify-start' : 'justify-end'}`}
                >
                  <div className={`flex items-start gap-3 max-w-[95%] lg:max-w-[85%] ${isAssistant ? '' : 'flex-row-reverse'}`}>
                    <div className={`assistant-avatar ${isAssistant ? 'assistant-avatar-bot' : 'assistant-avatar-user'}`}>
                      {isAssistant ? <Bot size={16} /> : <User2 size={16} />}
                    </div>

                    <div className={`assistant-bubble ${isAssistant ? 'assistant-bubble-bot' : 'assistant-bubble-user'}`}>
                      <p className="whitespace-pre-wrap leading-7 text-sm lg:text-[15px]">
                        {message.renderedText}
                        {message.isStreaming ? <span className="assistant-cursor" /> : null}
                      </p>

                      {isAssistant && message.error ? (
                        <AIErrorState
                          error={message.error}
                          onRetry={() => {
                            void submitPrompt(message.error?.sourcePrompt || retryPrompt || input, { isRetry: true })
                          }}
                          onUseSuggestion={(suggestion) => {
                            setInput(suggestion)
                            void submitPrompt(suggestion)
                          }}
                        />
                      ) : null}

                      {isAssistant && message.previews && message.previews.length > 0 ? (
                        <div className="mt-4 grid grid-cols-1 xl:grid-cols-2 gap-3">
                          {message.previews.map((preview) => (
                            <section key={preview.id} className="assistant-preview-card">
                              <div className="flex items-center justify-between gap-2 mb-2">
                                <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">{preview.title}</h3>
                                <button
                                  type="button"
                                  onClick={() => {
                                    void copySQL(preview.sql)
                                  }}
                                  className="inline-flex items-center gap-1 rounded-md border border-slate-300 dark:border-dark-600 px-2 py-1 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-dark-700"
                                >
                                  <Copy size={12} />
                                  Copy
                                </button>
                              </div>

                              <p className="text-xs text-slate-600 dark:text-slate-300 mb-2">{preview.rationale}</p>
                              <pre className="assistant-sql-block">{preview.sql}</pre>
                            </section>
                          ))}
                        </div>
                      ) : null}
                    </div>
                  </div>
                </article>
              )
            })}

            {isThinking ? (
              <div className="assistant-message-row justify-start">
                <div className="flex items-center gap-2 px-3 py-2 rounded-full bg-slate-200/80 dark:bg-dark-700/80 text-slate-700 dark:text-slate-200 text-xs font-medium">
                  <Loader2 size={14} className="animate-spin" />
                  Streaming response...
                </div>
              </div>
            ) : null}
            <div ref={scrollAnchorRef} />
          </div>

          <div className="border-t border-slate-200 dark:border-dark-700 p-4 lg:p-5 bg-white/90 dark:bg-dark-800/90">
            <div className="flex flex-wrap gap-2 mb-3">
              {suggestionChips.map((suggestion) => (
                <button
                  key={suggestion}
                  type="button"
                  onClick={() => setInput(suggestion)}
                  className="rounded-full border border-slate-300 dark:border-dark-600 px-3 py-1.5 text-xs text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-dark-700"
                >
                  {suggestion}
                </button>
              ))}
            </div>

            <div className="flex items-end gap-3">
              <label className="flex-1 rounded-2xl border border-slate-300 dark:border-dark-600 bg-white dark:bg-dark-900 p-3 focus-within:ring-2 focus-within:ring-cyan-500/40">
                <textarea
                  value={input}
                  onChange={(event) => setInput(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' && !event.shiftKey) {
                      event.preventDefault()
                      submitPrompt(input)
                    }
                  }}
                  rows={2}
                  placeholder="Ask for metrics, cohorts, anomalies, and SQL-ready analysis..."
                  className="w-full bg-transparent text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-500 dark:placeholder:text-slate-400 resize-none outline-none"
                />
              </label>

              <button
                type="button"
                onClick={() => {
                  void submitPrompt(input)
                }}
                disabled={!canSend}
                className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-cyan-600 text-white transition-colors hover:bg-cyan-700 disabled:cursor-not-allowed disabled:opacity-50"
                aria-label="Send prompt"
              >
                <Send size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default AnalyticsAssistant
