import type {
  ActivityMonitoringResponse,
  DashboardAnalyticsResponse,
  QueryHistoryRecord,
  SQLExecuteResponse,
  SQLGenerateResponse,
  SQLValidationResponse,
  UserActivityItem,
} from '../types/api'

const pseudoRandom = (seed: number) => {
  const x = Math.sin(seed) * 10000
  return x - Math.floor(x)
}

const queryHistorySeed: QueryHistoryRecord[] = [
  {
    id: 'qh-001',
    title: 'Weekly active users trend',
    sql: "SELECT DATE_TRUNC('week', occurred_at) AS week_start, COUNT(DISTINCT user_id) AS active_users FROM analytics.event_stream GROUP BY week_start ORDER BY week_start;",
    executedAt: '2026-06-18T09:42:00Z',
    database: 'analytics',
    status: 'Success',
    durationMs: 382,
    rowsReturned: 12,
    scannedMb: 18.4,
    costCredits: 0.38,
  },
  {
    id: 'qh-002',
    title: 'Failed orders in last 24h',
    sql: "SELECT id, user_id, total_amount, status FROM public.orders WHERE status = 'failed' AND placed_at >= NOW() - INTERVAL '1 day' ORDER BY placed_at DESC;",
    executedAt: '2026-06-18T08:19:00Z',
    database: 'public',
    status: 'Success',
    durationMs: 245,
    rowsReturned: 57,
    scannedMb: 5.7,
    costCredits: 0.19,
  },
  {
    id: 'qh-003',
    title: 'Orders with null totals audit',
    sql: 'SELECT id, user_id, total_amount, status FROM public.orders WHERE total_amount IS NULL LIMIT 200;',
    executedAt: '2026-06-18T07:27:00Z',
    database: 'public',
    status: 'Failed',
    durationMs: 147,
    rowsReturned: 0,
    scannedMb: 8.2,
    costCredits: 0.11,
  },
]

export const mockDelay = (ms = 500) => new Promise<void>((resolve) => setTimeout(resolve, ms))

export const getMockQueryHistory = async (): Promise<QueryHistoryRecord[]> => {
  await mockDelay(420)
  return queryHistorySeed
}

export const getMockDashboardAnalytics = async (): Promise<DashboardAnalyticsResponse> => {
  await mockDelay(480)
  const history = queryHistorySeed
  const totalQueries = history.length
  const success = history.filter((item) => item.status === 'Success').length
  const avgDurationMs = Math.round(history.reduce((sum, item) => sum + item.durationMs, 0) / totalQueries)

  return {
    kpi: {
      totalQueries,
      successRate: Math.round((success / totalQueries) * 100),
      avgDurationMs,
      totalRowsReturned: history.reduce((sum, item) => sum + item.rowsReturned, 0),
    },
    history,
  }
}

export const getMockGeneratedSql = async (prompt: string): Promise<SQLGenerateResponse> => {
  await mockDelay(650)
  const lowered = prompt.toLowerCase()

  if (lowered.includes('revenue')) {
    return {
      sql: "SELECT DATE_TRUNC('month', invoice_date) AS month, SUM(amount_usd) AS revenue FROM billing.invoices WHERE invoice_date >= NOW() - INTERVAL '6 months' GROUP BY month ORDER BY month;",
      confidence: 0.93,
      explanation: 'Grouped paid invoices by month and summed revenue.',
    }
  }

  return {
    sql: "SELECT DATE_TRUNC('day', occurred_at) AS day, COUNT(*) AS events FROM analytics.event_stream WHERE occurred_at >= NOW() - INTERVAL '30 days' GROUP BY day ORDER BY day;",
    confidence: 0.88,
    explanation: 'Generated a daily trend query based on prompt intent.',
  }
}

export const getMockSqlValidation = async (sql: string): Promise<SQLValidationResponse> => {
  await mockDelay(220)
  const hasSelect = /\bselect\b/i.test(sql)
  const hasWhere = /\bwhere\b/i.test(sql)

  if (!hasSelect) {
    return {
      status: 'invalid',
      issues: ['Only SELECT queries are allowed in this environment.'],
      estimatedCostCredits: 0,
    }
  }

  if (!hasWhere) {
    return {
      status: 'warning',
      issues: ['Consider adding a WHERE clause to limit scan costs.'],
      estimatedCostCredits: 1.5,
    }
  }

  return {
    status: 'valid',
    issues: [],
    estimatedCostCredits: 0.7,
  }
}

export const getMockExecution = async (): Promise<SQLExecuteResponse> => {
  await mockDelay(700)
  const rows = Array.from({ length: 150 }).map((_, idx) => {
    const seed = pseudoRandom(idx + 1)
    return {
      date: `2026-06-${String((idx % 30) + 1).padStart(2, '0')}`,
      metric: `segment_${(idx % 6) + 1}`,
      value: Math.round(seed * 1000),
      is_anomaly: seed > 0.92,
    }
  })

  return {
    columns: ['date', 'metric', 'value', 'is_anomaly'],
    rows,
    rowCount: rows.length,
    durationMs: 318,
    requestId: `mock-${Date.now().toString(36)}`,
  }
}

const buildUserActivity = (): UserActivityItem[] => [
  { user: 'sarah.kim@corp.com', role: 'analyst', queries: 842, aiGenerated: 691, avgLatencyMs: 118 },
  { user: 'priya.patel@corp.com', role: 'admin', queries: 710, aiGenerated: 620, avgLatencyMs: 109 },
  { user: 'alex.torres@corp.com', role: 'viewer', queries: 302, aiGenerated: 210, avgLatencyMs: 142 },
]

export const getMockActivityMonitoring = async (): Promise<ActivityMonitoringResponse> => {
  await mockDelay(360)
  return {
    apiHealth: [
      { service: 'Auth API', status: 'healthy', responseTimeMs: 64, region: 'us-east-1' },
      { service: 'SQL Generator API', status: 'healthy', responseTimeMs: 242, region: 'us-east-1' },
      { service: 'Execution API', status: 'degraded', responseTimeMs: 544, region: 'us-east-1' },
    ],
    generationMetrics: Array.from({ length: 12 }).map((_, idx) => ({
      minute: `${idx + 1}m`,
      successful: 40 + Math.round(pseudoRandom(idx) * 12),
      failed: Math.round(pseudoRandom(idx + 10) * 4),
      avgResponseMs: 180 + Math.round(pseudoRandom(idx + 30) * 120),
    })),
    failedPromptMetrics: [
      { type: 'Schema mismatch', count: 18 },
      { type: 'Timeout', count: 9 },
      { type: 'Rate limit', count: 4 },
      { type: 'Permission', count: 3 },
    ],
    queryExecutionLogs: Array.from({ length: 10 }).map((_, idx) => ({
      id: `log-${idx + 1}`,
      ts: new Date(Date.now() - idx * 1000 * 60 * 4).toISOString(),
      status: idx % 4 === 0 ? 'Failed' : 'Success',
      latencyMs: 120 + Math.round(pseudoRandom(idx + 40) * 500),
      prompt: idx % 3 === 0 ? 'Compare conversion by segment' : 'Show weekly active users',
    })),
    userActivity: buildUserActivity(),
  }
}
