import React, { useMemo, useState } from 'react'
import { BarChart3, CheckCircle2, Clock3, Database, Eye, Search, Timer, X, XCircle } from 'lucide-react'
import toast from 'react-hot-toast'
import { useDashboardData } from '../hooks/useDashboardData'
import type { QueryHistoryRecord, QueryStatus } from '../types/api'
import LoadingSkeleton from './LoadingSkeleton'
import QueryWorkbench from './QueryWorkbench'

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
  const { data, isLoading, error, refresh } = useDashboardData(false)

  const history = useMemo(() => data?.history ?? [], [data])

  const filteredHistory = useMemo(() => {
    const normalized = searchTerm.trim().toLowerCase()

    return history.filter((item) => {
      const matchesSearch =
        !normalized ||
        item.title.toLowerCase().includes(normalized) ||
        item.sql.toLowerCase().includes(normalized) ||
        item.database.toLowerCase().includes(normalized)

      const matchesStatus = statusFilter === 'All' || item.status === statusFilter

      return matchesSearch && matchesStatus
    })
  }, [history, searchTerm, statusFilter])

  const metrics = useMemo(() => {
    const total = filteredHistory.length
    const successful = filteredHistory.filter((item) => item.status === 'Success').length
    const successRate = total === 0 ? 0 : Math.round((successful / total) * 100)
    const avgDuration = total === 0 ? 0 : Math.round(filteredHistory.reduce((sum, item) => sum + item.durationMs, 0) / total)
    const totalRows = filteredHistory.reduce((sum, item) => sum + item.rowsReturned, 0)

    return { total, successRate, avgDuration, totalRows }
  }, [filteredHistory])

  if (isLoading && !data) {
    return (
      <div className="dashboard-atmosphere p-4 lg:p-8 min-h-[calc(100vh-4rem)]">
        <LoadingSkeleton type="card" count={2} />
        <LoadingSkeleton type="table" count={5} className="mt-6" />
      </div>
    )
  }

  if (!data) {
    return (
      <div className="dashboard-atmosphere p-4 lg:p-8 min-h-[calc(100vh-4rem)]">
        <div className="card text-rose-600 dark:text-rose-300">
          <p className="font-semibold">Failed to load dashboard data</p>
          <p className="text-sm mt-1">{error || 'Unexpected error loading analytics data.'}</p>
          <button
            type="button"
            onClick={() => {
              void refresh().catch(() => {
                toast.error('Unable to reload dashboard data')
              })
            }}
            className="btn btn-primary text-sm mt-4"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="dashboard-atmosphere p-4 lg:p-8 min-h-[calc(100vh-4rem)]">
      <QueryWorkbench />

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
            <Filter className="text-gray-500 dark:text-gray-400 flex-shrink-0" width={16} height={16} />
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
          <article key={item.id} className="history-card" style={{ animationDelay: `${index * 80}ms` }}>
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
