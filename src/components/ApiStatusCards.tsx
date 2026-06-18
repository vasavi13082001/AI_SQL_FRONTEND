import { memo } from 'react'
import { Activity, CheckCircle2, AlertTriangle, XCircle } from 'lucide-react'
import type { ApiHealthItem } from '../types/api'

type ApiStatusCardsProps = {
  items: ApiHealthItem[]
}

const statusStyles = {
  healthy: {
    icon: CheckCircle2,
    tone: 'text-emerald-600 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-900/20',
  },
  degraded: {
    icon: AlertTriangle,
    tone: 'text-amber-600 dark:text-amber-300 bg-amber-50 dark:bg-amber-900/20',
  },
  down: {
    icon: XCircle,
    tone: 'text-rose-600 dark:text-rose-300 bg-rose-50 dark:bg-rose-900/20',
  },
}

const ApiStatusCards = ({ items }: ApiStatusCardsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {items.map((item) => {
        const style = statusStyles[item.status]
        const Icon = style.icon

        return (
          <article key={item.service} className="card p-4" aria-label={`${item.service} status ${item.status}`}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">{item.service}</p>
                <p className="mt-1 text-sm text-gray-700 dark:text-gray-300">{item.region}</p>
              </div>
              <div className={`rounded-lg p-2 ${style.tone}`}>
                <Icon size={16} />
              </div>
            </div>

            <div className="mt-3 flex items-center justify-between">
              <span className="text-sm font-semibold text-gray-900 dark:text-white capitalize">{item.status}</span>
              <span className="inline-flex items-center gap-1 text-xs text-gray-600 dark:text-gray-300">
                <Activity size={13} />
                {item.responseTimeMs}ms
              </span>
            </div>
          </article>
        )
      })}
    </div>
  )
}

export default memo(ApiStatusCards)
