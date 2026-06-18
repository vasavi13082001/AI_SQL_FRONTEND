import type { AuthUser, UserRole } from './auth'

export interface ApiResponse<T> {
  data: T
  message?: string
  requestId?: string
}

export interface ApiErrorPayload {
  code: string
  message: string
  details?: string
  status?: number
  requestId?: string
}

export interface LoginRequest {
  email: string
  password: string
  role?: UserRole
}

export interface RegisterRequest {
  name: string
  email: string
  password: string
  role: UserRole
}

export interface AuthResponse {
  token: string
  user: AuthUser
}

export interface SQLGenerateRequest {
  prompt: string
  context?: string
}

export interface SQLGenerateResponse {
  sql: string
  confidence: number
  explanation?: string
}

export type SQLValidationStatus = 'valid' | 'invalid' | 'warning'

export interface SQLValidationResponse {
  status: SQLValidationStatus
  issues: string[]
  estimatedCostCredits: number
}

export interface SQLExecuteRequest {
  sql: string
}

export interface SQLExecutionResultRow {
  [key: string]: string | number | boolean | null
}

export interface SQLExecuteResponse {
  columns: string[]
  rows: SQLExecutionResultRow[]
  rowCount: number
  durationMs: number
  requestId: string
}

export type QueryStatus = 'Success' | 'Failed' | 'Running'

export interface QueryHistoryRecord {
  id: string
  title: string
  sql: string
  executedAt: string
  database: string
  status: QueryStatus
  durationMs: number
  rowsReturned: number
  scannedMb: number
  costCredits: number
}

export interface DashboardKpi {
  totalQueries: number
  successRate: number
  avgDurationMs: number
  totalRowsReturned: number
}

export interface DashboardAnalyticsResponse {
  kpi: DashboardKpi
  history: QueryHistoryRecord[]
}

export interface ApiHealthItem {
  service: string
  status: 'healthy' | 'degraded' | 'down'
  responseTimeMs: number
  region: string
}

export interface SqlGenerationMetricPoint {
  minute: string
  successful: number
  failed: number
  avgResponseMs: number
}

export interface FailedPromptMetric {
  type: string
  count: number
}

export interface UserActivityItem {
  [key: string]: string | number
  user: string
  role: UserRole
  queries: number
  aiGenerated: number
  avgLatencyMs: number
}

export interface QueryExecutionLog {
  id: string
  ts: string
  status: 'Success' | 'Failed'
  latencyMs: number
  prompt: string
}

export interface ActivityMonitoringResponse {
  apiHealth: ApiHealthItem[]
  generationMetrics: SqlGenerationMetricPoint[]
  failedPromptMetrics: FailedPromptMetric[]
  queryExecutionLogs: QueryExecutionLog[]
  userActivity: UserActivityItem[]
}
