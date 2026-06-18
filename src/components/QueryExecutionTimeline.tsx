import { memo } from 'react'
import { LineChart, Line, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts'
import type { QueryExecutionLog } from '../types/api'

type QueryExecutionTimelineProps = {
  logs: QueryExecutionLog[]
}

const QueryExecutionTimeline = ({ logs }: QueryExecutionTimelineProps) => {
  const chartData = [...logs]
    .reverse()
    .map((item, index) => ({
      label: `T-${logs.length - index}`,
      latencyMs: item.latencyMs,
      status: item.status,
    }))

  return (
    <div className="card p-4">
      <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-3">Query Execution Timeline</h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#cbd5e1" />
            <XAxis dataKey="label" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip />
            <Line type="monotone" dataKey="latencyMs" stroke="#0ea5e9" strokeWidth={2.2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-3 space-y-2">
        {logs.slice(0, 5).map((log) => (
          <div key={log.id} className="flex items-center justify-between text-xs border-b border-gray-100 dark:border-dark-700 pb-2">
            <span className="text-gray-700 dark:text-gray-300 truncate max-w-[60%]">{log.prompt}</span>
            <span className={log.status === 'Success' ? 'text-emerald-600' : 'text-rose-600'}>{log.status}</span>
            <span className="text-gray-600 dark:text-gray-400">{log.latencyMs}ms</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default memo(QueryExecutionTimeline)
