import React, { useMemo, useState } from 'react'
import {
  BarChart3,
  CheckCircle2,
  Clock3,
  Database,
  Eye,
  Search,
  Timer,
  X,
  XCircle,
} from 'lucide-react'

type QueryStatus = 'Success' | 'Failed' | 'Running'

type QueryHistoryRecord = {
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

const queryHistory: QueryHistoryRecord[] = [
  {
    id: 'qh-001',
    title: 'Weekly active users trend',
    sql: `SELECT DATE_TRUNC('week', occurred_at) AS week_start,\n       COUNT(DISTINCT user_id) AS active_users\nFROM analytics.event_stream\nWHERE occurred_at >= NOW() - INTERVAL '12 weeks'\nGROUP BY week_start\nORDER BY week_start;`,
    executedAt: '2026-05-25T09:42:00Z',
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
    sql: `SELECT id, user_id, total_amount, status, placed_at\nFROM public.orders\nWHERE status = 'failed'\n  AND placed_at >= NOW() - INTERVAL '1 day'\nORDER BY placed_at DESC;`,
    executedAt: '2026-05-25T08:19:00Z',
    database: 'public',
    status: 'Success',
    durationMs: 245,
    rowsReturned: 57,
    scannedMb: 5.7,
    costCredits: 0.19,
  },
  {
    id: 'qh-003',
    title: 'Top spenders this quarter',
    sql: `SELECT user_id, SUM(total_amount) AS total_spend\nFROM public.orders\nWHERE placed_at >= DATE_TRUNC('quarter', NOW())\nGROUP BY user_id\nORDER BY total_spend DESC\nLIMIT 20;`,
    executedAt: '2026-05-25T07:04:00Z',
    database: 'public',
    status: 'Success',
    durationMs: 512,
    rowsReturned: 20,
    scannedMb: 42.1,
    costCredits: 0.66,
  },
  {
    id: 'qh-004',
    title: 'Session rollups refresh check',
    sql: `SELECT started_at::date AS day,\n       AVG(duration_seconds) AS avg_duration_sec,\n       COUNT(*) AS sessions\nFROM analytics.session_rollups\nGROUP BY day\nORDER BY day DESC\nLIMIT 30;`,
    executedAt: '2026-05-25T06:10:00Z',
    database: 'analytics',
    status: 'Running',
    durationMs: 1890,
    rowsReturned: 0,
    scannedMb: 74.3,
    costCredits: 1.02,
  },
  {
    id: 'qh-005',
    title: 'Orders with null totals audit',
    sql: `SELECT id, user_id, total_amount, status\nFROM public.orders\nWHERE total_amount IS NULL\nORDER BY placed_at DESC\nLIMIT 200;`,
    executedAt: '2026-05-24T21:27:00Z',
    database: 'public',
    status: 'Failed',
    durationMs: 147,
    rowsReturned: 0,
    scannedMb: 8.2,
    costCredits: 0.11,
  },
  {
    id: 'qh-006',
    title: 'Event volume anomaly scan',
    sql: `SELECT DATE_TRUNC('hour', occurred_at) AS hour_bucket,\n       COUNT(*) AS events\nFROM analytics.event_stream\nWHERE occurred_at >= NOW() - INTERVAL '72 hours'\nGROUP BY hour_bucket\nHAVING COUNT(*) > 25000\nORDER BY hour_bucket DESC;`,
    executedAt: '2026-05-24T17:33:00Z',
    database: 'analytics',
    status: 'Success',
    durationMs: 780,
    rowsReturned: 4,
    scannedMb: 110.6,
    costCredits: 1.48,
  },
]

const statusBadge: Record<QueryStatus, string> = {
  Success: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300',
  Failed: 'bg-rose-100 text-rose-700 dark:bg-rose-900 dark:text-rose-300',
  Running: 'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300',
}

const statusIcon: Record<QueryStatus, React.ReactNode> = {
  Success: <CheckCircle2 size={14} />,
  Failed: <XCircle size={14} />,
  Running: <Clock3 size={14} />,
}

const formatCompactNumber = (value: number) => new Intl.NumberFormat().format(value)

const formatRelativeTime = (isoTime: string) => {
  const deltaMs = Date.now() - new Date(isoTime).getTime()
  const deltaMinutes = Math.max(1, Math.round(deltaMs / 60000))

  if (deltaMinutes < 60) {
    return `${deltaMinutes}m ago`
  }

  const deltaHours = Math.round(deltaMinutes / 60)
  if (deltaHours < 24) {
    return `${deltaHours}h ago`
  }

  const deltaDays = Math.round(deltaHours / 24)
  return `${deltaDays}d ago`
}

const Dashboard: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<'All' | QueryStatus>('All')
  const [selectedQuery, setSelectedQuery] = useState<QueryHistoryRecord | null>(null)

  const filteredHistory = useMemo(() => {
    const normalized = searchTerm.trim().toLowerCase()

    return queryHistory.filter((item) => {
      const matchesSearch =
        !normalized ||
        item.title.toLowerCase().includes(normalized) ||
        item.sql.toLowerCase().includes(normalized) ||
        item.database.toLowerCase().includes(normalized)

      const matchesStatus = statusFilter === 'All' || item.status === statusFilter

      return matchesSearch && matchesStatus
    })
  }, [searchTerm, statusFilter])

  const metrics = useMemo(() => {
    const total = filteredHistory.length
    const successful = filteredHistory.filter((item) => item.status === 'Success').length
    const successRate = total === 0 ? 0 : Math.round((successful / total) * 100)
    const avgDuration =
      total === 0 ? 0 : Math.round(filteredHistory.reduce((sum, item) => sum + item.durationMs, 0) / total)
    const totalRows = filteredHistory.reduce((sum, item) => sum + item.rowsReturned, 0)

    return { total, successRate, avgDuration, totalRows }
  }, [filteredHistory])

  return (
    <div className="dashboard-atmosphere p-4 lg:p-8 min-h-[calc(100vh-4rem)]">
      <div className="mb-8">
        <h1 className="text-3xl lg:text-4xl font-bold tracking-tight text-gray-900 dark:text-white mb-2">
          Query History
        </h1>
        <p className="text-gray-600 dark:text-gray-400 max-w-2xl">
          Monitor executed SQL, investigate performance signals, and preview full statements without leaving the dashboard.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        <div className="history-card">
          <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-2">Queries</p>
          <div className="flex items-center justify-between">
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{metrics.total}</p>
            <BarChart3 className="text-teal-500" size={20} />
          </div>
        </div>

        <div className="history-card">
          <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-2">Success Rate</p>
          <div className="flex items-center justify-between">
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{metrics.successRate}%</p>
            <CheckCircle2 className="text-emerald-500" size={20} />
          </div>
        </div>

        <div className="history-card">
          <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-2">Avg. Duration</p>
          <div className="flex items-center justify-between">
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{metrics.avgDuration}ms</p>
            <Timer className="text-amber-500" size={20} />
          </div>
        </div>

        <div className="history-card">
          <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-2">Rows Returned</p>
          <div className="flex items-center justify-between">
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{formatCompactNumber(metrics.totalRows)}</p>
            <Database className="text-cyan-500" size={20} />
          </div>
        </div>
      </div>

      <div className="card mb-6">
        <div className="flex flex-col lg:flex-row lg:items-center gap-3">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search by query title, SQL text, or database..."
              className="w-full rounded-lg border border-gray-200 dark:border-dark-600 bg-white dark:bg-dark-800 pl-9 pr-3 py-2.5 text-sm text-gray-900 dark:text-gray-100 outline-none focus:ring-2 focus:ring-teal-500/40"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto">
            <Filter className="text-gray-500 dark:text-gray-400 flex-shrink-0" size={16} />
            {(['All', 'Success', 'Failed', 'Running'] as const).map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                  statusFilter === status
                    ? 'bg-teal-600 text-white dark:bg-teal-500'
                    : 'bg-gray-100 text-gray-700 dark:bg-dark-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-dark-600'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
        {filteredHistory.map((item, index) => (
          <article
            key={item.id}
            className="history-card"
            style={{ animationDelay: `${index * 80}ms` }}
          >
            <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{item.title}</h2>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {new Date(item.executedAt).toLocaleString()} ({formatRelativeTime(item.executedAt)})
                </p>
              </div>

              <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold ${statusBadge[item.status]}`}>
                {statusIcon[item.status]}
                {item.status}
              </span>
            </div>

            <div className="rounded-lg border border-gray-200/80 dark:border-dark-700 bg-gray-50/80 dark:bg-dark-900 px-3 py-2 mb-4">
              <p className="font-mono text-xs text-gray-700 dark:text-gray-300 leading-5 break-all">
                {item.sql.replace(/\s+/g, ' ').trim().slice(0, 180)}...
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Duration</p>
                <p className="font-semibold text-gray-900 dark:text-white">{item.durationMs}ms</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Rows</p>
                <p className="font-semibold text-gray-900 dark:text-white">{formatCompactNumber(item.rowsReturned)}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Scanned</p>
                <p className="font-semibold text-gray-900 dark:text-white">{item.scannedMb.toFixed(1)} MB</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Credits</p>
                <p className="font-semibold text-gray-900 dark:text-white">{item.costCredits.toFixed(2)}</p>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-dark-700 flex items-center justify-between">
              <span className="text-xs text-gray-500 dark:text-gray-400">DB: {item.database}</span>
              <button
                onClick={() => setSelectedQuery(item)}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium bg-teal-600 text-white hover:bg-teal-700 dark:bg-teal-500 dark:hover:bg-teal-600 transition-colors"
              >
                <Eye size={14} />
                SQL Preview
              </button>
            </div>
          </article>
        ))}
      </div>

      {filteredHistory.length === 0 ? (
        <div className="card mt-6 text-center py-10">
          <p className="text-gray-700 dark:text-gray-300 font-medium mb-1">No queries match your current filters</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">Try broadening your search text or selecting a different status.</p>
        </div>
      ) : null}

      {selectedQuery ? (
        <div
          className="fixed inset-0 z-[70] bg-black/60 backdrop-blur-sm p-4 flex items-center justify-center"
          role="dialog"
          aria-modal="true"
          onClick={() => setSelectedQuery(null)}
        >
          <div
            className="modal-glass w-full max-w-3xl rounded-xl border border-gray-200 dark:border-dark-700 p-5 lg:p-6"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4 mb-5">
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">{selectedQuery.title}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Executed {new Date(selectedQuery.executedAt).toLocaleString()} on {selectedQuery.database}
                </p>
              </div>
              <button
                onClick={() => setSelectedQuery(null)}
                className="p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-700"
                aria-label="Close SQL preview"
              >
                <X size={18} />
              </button>
            </div>

            <div className="rounded-lg bg-gray-900 text-gray-100 p-4 overflow-auto max-h-[50vh]">
              <pre className="font-mono text-sm leading-6 whitespace-pre-wrap break-all">{selectedQuery.sql}</pre>
            </div>

            <div className="mt-5 flex flex-wrap gap-4 text-sm text-gray-700 dark:text-gray-300">
              <p>
                <span className="text-gray-500 dark:text-gray-400">Duration:</span> {selectedQuery.durationMs}ms
              </p>
              <p>
                <span className="text-gray-500 dark:text-gray-400">Rows:</span> {formatCompactNumber(selectedQuery.rowsReturned)}
              </p>
              <p>
                <span className="text-gray-500 dark:text-gray-400">Scanned:</span> {selectedQuery.scannedMb.toFixed(1)} MB
              </p>
              <p>
                <span className="text-gray-500 dark:text-gray-400">Credits:</span> {selectedQuery.costCredits.toFixed(2)}
              </p>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}

const Filter: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M3 5h18" />
    <path d="M6 12h12" />
    <path d="M10 19h4" />
  </svg>
)

export default Dashboard
