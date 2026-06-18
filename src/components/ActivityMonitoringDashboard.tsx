import { useCallback } from 'react'
import { BarChart, Bar, ResponsiveContainer, XAxis, YAxis, Tooltip, PieChart, Pie, Cell, CartesianGrid } from 'recharts'
import toast from 'react-hot-toast'
import { useActivityMonitoring } from '../hooks/useActivityMonitoring'
import LoadingSkeleton from './LoadingSkeleton'
import DataTable from './DataTable'
import ApiStatusCards from './ApiStatusCards'
import QueryExecutionTimeline from './QueryExecutionTimeline'

const pieColors = ['#ef4444', '#f97316', '#eab308', '#0ea5e9']

const ActivityMonitoringDashboard = () => {
  const { data, isLoading, error, refresh } = useActivityMonitoring()

  const manualRefresh = useCallback(async () => {
    try {
      await refresh()
    } catch {
      toast.error('Failed to refresh activity monitoring data')
    }
  }, [refresh])

  if (isLoading && !data) {
    return (
      <div className="p-4 lg:p-8">
        <LoadingSkeleton type="card" count={2} />
        <LoadingSkeleton type="chart" className="mt-4" />
      </div>
    )
  }

  if (!data) {
    return (
      <div className="p-4 lg:p-8">
        <div className="card text-sm text-rose-600 dark:text-rose-300">
          {error || 'No monitoring data available.'}
        </div>
      </div>
    )
  }

  const avgResponseMs = Math.round(
    data.generationMetrics.reduce((sum, item) => sum + item.avgResponseMs, 0) / data.generationMetrics.length,
  )
  const totalFailedPrompts = data.failedPromptMetrics.reduce((sum, item) => sum + item.count, 0)

  return (
    <div className="p-4 lg:p-8 space-y-6 min-h-[calc(100vh-4rem)]">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Warehouse Activity Monitor</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">Real-time API and AI query health overview.</p>
        </div>

        <button
          type="button"
          onClick={() => {
            void manualRefresh()
          }}
          className="btn btn-primary text-sm"
          aria-label="Refresh activity dashboard"
        >
          Refresh
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <div className="card p-4">
          <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">API Services</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{data.apiHealth.length}</p>
        </div>
        <div className="card p-4">
          <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">Avg Response Time</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{avgResponseMs}ms</p>
        </div>
        <div className="card p-4">
          <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">Failed Prompts</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{totalFailedPrompts}</p>
        </div>
        <div className="card p-4">
          <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">Tracked Users</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{data.userActivity.length}</p>
        </div>
      </div>

      <ApiStatusCards items={data.apiHealth} />

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="card p-4">
          <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-3">AI Performance Metrics</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.generationMetrics}>
                <CartesianGrid strokeDasharray="3 3" stroke="#cbd5e1" />
                <XAxis dataKey="minute" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="successful" fill="#10b981" radius={[3, 3, 0, 0]} />
                <Bar dataKey="failed" fill="#ef4444" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card p-4">
          <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-3">Failed Prompt Breakdown</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={data.failedPromptMetrics} dataKey="count" nameKey="type" outerRadius={96}>
                  {data.failedPromptMetrics.map((entry, index) => (
                    <Cell key={entry.type} fill={pieColors[index % pieColors.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <QueryExecutionTimeline logs={data.queryExecutionLogs} />

      <DataTable
        title="User Activity Tracking"
        data={data.userActivity}
        columns={[
          { key: 'user', header: 'User', sortable: true },
          { key: 'role', header: 'Role', sortable: true },
          { key: 'queries', header: 'Queries', sortable: true },
          { key: 'aiGenerated', header: 'AI Generated', sortable: true },
          { key: 'avgLatencyMs', header: 'Avg Latency (ms)', sortable: true },
        ]}
        searchPlaceholder="Search users"
        emptyMessage="No user activity yet."
      />
    </div>
  )
}

export default ActivityMonitoringDashboard
