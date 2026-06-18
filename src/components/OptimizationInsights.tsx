import React, { useMemo, useState } from 'react'
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  CircleDollarSign,
  Clock,
  Code2,
  Cpu,
  ExternalLink,
  Info,
  Lightbulb,
  RefreshCw,
  Sparkles,
  TrendingDown,
  Zap,
} from 'lucide-react'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type Severity = 'critical' | 'warning' | 'info'
type Category = 'index' | 'scan' | 'join' | 'cte' | 'sort' | 'subquery' | 'general'

interface OptimizationRule {
  id: string
  category: Category
  severity: Severity
  title: string
  description: string
  recommendation: string
  estimatedSpeedupPct: number   // 0–100
  estimatedCostSavingPct: number // 0–100
  affectedQueries: string[]     // query IDs
  exampleBefore?: string
  exampleAfter?: string
}

interface QueryInsightSummary {
  queryId: string
  queryTitle: string
  durationMs: number
  scannedMb: number
  costCredits: number
  optimizedDurationMs: number
  optimizedScannedMb: number
  optimizedCostCredits: number
  rules: string[] // rule IDs
}

// ---------------------------------------------------------------------------
// Static insight data (derived from the query history fixture)
// ---------------------------------------------------------------------------

const optimizationRules: OptimizationRule[] = [
  {
    id: 'rule-001',
    category: 'index',
    severity: 'critical',
    title: 'Missing index on filter column',
    description:
      'Queries filtering on analytics.event_stream.occurred_at perform full table scans because no B-tree index covers that column. Each execution scans the entire partition.',
    recommendation:
      'Create a partial index on occurred_at with a WHERE clause covering the most common look-back window (e.g. last 90 days) to eliminate full scans.',
    estimatedSpeedupPct: 65,
    estimatedCostSavingPct: 58,
    affectedQueries: ['qh-001', 'qh-004', 'qh-006'],
    exampleBefore: `-- Full scan\nSELECT * FROM analytics.event_stream\nWHERE occurred_at >= NOW() - INTERVAL '12 weeks';`,
    exampleAfter: `-- After index\nCREATE INDEX CONCURRENTLY idx_events_occurred_at\n  ON analytics.event_stream (occurred_at)\n  WHERE occurred_at >= NOW() - INTERVAL '90 days';\n\n-- Same query now uses index scan`,
  },
  {
    id: 'rule-002',
    category: 'scan',
    severity: 'critical',
    title: 'Excessive data scan per query',
    description:
      'Three queries collectively scan over 240 MB of data. The event volume anomaly scan alone reads 110.6 MB to return only 4 rows — a 99.96% row discard rate.',
    recommendation:
      'Add tighter time-range predicates and leverage columnar projection. If using a columnar store, select only required columns to reduce I/O.',
    estimatedSpeedupPct: 72,
    estimatedCostSavingPct: 68,
    affectedQueries: ['qh-001', 'qh-004', 'qh-006'],
    exampleBefore: `SELECT DATE_TRUNC('hour', occurred_at), COUNT(*)\nFROM analytics.event_stream\nWHERE occurred_at >= NOW() - INTERVAL '72 hours'\nGROUP BY 1\nHAVING COUNT(*) > 25000;`,
    exampleAfter: `-- Pre-aggregate in a materialized view refreshed hourly\nSELECT hour_bucket, event_count\nFROM analytics.event_stream_hourly_agg\nWHERE hour_bucket >= NOW() - INTERVAL '72 hours'\n  AND event_count > 25000;`,
  },
  {
    id: 'rule-003',
    category: 'cte',
    severity: 'warning',
    title: 'Replace subqueries with CTEs or pre-aggregations',
    description:
      'The top-spenders query computes SUM(total_amount) over all orders every execution. This computation could be offloaded to a scheduled materialised view refreshed daily.',
    recommendation:
      'Create a materialized view orders_spend_daily and query that instead. Reduces scanned data from 42.1 MB to under 1 MB for most look-back windows.',
    estimatedSpeedupPct: 82,
    estimatedCostSavingPct: 75,
    affectedQueries: ['qh-003'],
    exampleBefore: `SELECT user_id, SUM(total_amount) AS total_spend\nFROM public.orders\nWHERE placed_at >= DATE_TRUNC('quarter', NOW())\nGROUP BY user_id\nORDER BY total_spend DESC\nLIMIT 20;`,
    exampleAfter: `-- Materialized view (refresh daily at midnight)\nCREATE MATERIALIZED VIEW orders_spend_daily AS\nSELECT user_id,\n       DATE_TRUNC('day', placed_at) AS day,\n       SUM(total_amount) AS daily_spend\nFROM public.orders\nGROUP BY user_id, day;\n\n-- Fast query\nSELECT user_id, SUM(daily_spend) AS total_spend\nFROM orders_spend_daily\nWHERE day >= DATE_TRUNC('quarter', NOW())\nGROUP BY user_id\nORDER BY total_spend DESC\nLIMIT 20;`,
  },
  {
    id: 'rule-004',
    category: 'sort',
    severity: 'warning',
    title: 'Unindexed ORDER BY on high-cardinality column',
    description:
      'Multiple queries include ORDER BY placed_at DESC or ORDER BY week_start without a supporting index. The planner falls back to an in-memory or on-disk sort.',
    recommendation:
      'Add a BRIN or B-tree index on placed_at and other timestamp columns used in ORDER BY clauses. BRIN is particularly cheap for append-only time-series tables.',
    estimatedSpeedupPct: 30,
    estimatedCostSavingPct: 20,
    affectedQueries: ['qh-002', 'qh-003', 'qh-005'],
    exampleBefore: `SELECT * FROM public.orders\nWHERE status = 'failed'\nORDER BY placed_at DESC;`,
    exampleAfter: `CREATE INDEX idx_orders_placed_at_brin\n  ON public.orders USING BRIN (placed_at);\n\n-- Planner now avoids full sort`,
  },
  {
    id: 'rule-005',
    category: 'general',
    severity: 'info',
    title: 'Enable query result caching',
    description:
      'Recurring aggregation queries (weekly active users, session rollups) return identical results when re-run within the same time window. Result-set caching could eliminate redundant execution.',
    recommendation:
      'Wrap read-only aggregation queries in a caching layer (Redis TTL, CDN edge cache, or your warehouse\'s native result cache). Configure a 15-minute TTL for hourly and daily aggregations.',
    estimatedSpeedupPct: 95,
    estimatedCostSavingPct: 90,
    affectedQueries: ['qh-001', 'qh-004'],
  },
  {
    id: 'rule-006',
    category: 'subquery',
    severity: 'info',
    title: 'Use LIMIT early in aggregation pipelines',
    description:
      'Applying LIMIT after heavy aggregation wastes CPU on rows that will be discarded. Pre-filtering with a subquery or window function can cut CPU time significantly.',
    recommendation:
      'Use a RANK() or ROW_NUMBER() window function to filter inside a CTE before the final SELECT, allowing the planner to prune rows earlier in the pipeline.',
    estimatedSpeedupPct: 25,
    estimatedCostSavingPct: 15,
    affectedQueries: ['qh-003', 'qh-006'],
  },
]

const queryInsights: QueryInsightSummary[] = [
  {
    queryId: 'qh-001',
    queryTitle: 'Weekly active users trend',
    durationMs: 382,
    scannedMb: 18.4,
    costCredits: 0.38,
    optimizedDurationMs: 134,
    optimizedScannedMb: 7.2,
    optimizedCostCredits: 0.14,
    rules: ['rule-001', 'rule-005'],
  },
  {
    queryId: 'qh-003',
    queryTitle: 'Top spenders this quarter',
    durationMs: 512,
    scannedMb: 42.1,
    costCredits: 0.66,
    optimizedDurationMs: 92,
    optimizedScannedMb: 0.8,
    optimizedCostCredits: 0.09,
    rules: ['rule-003', 'rule-004', 'rule-006'],
  },
  {
    queryId: 'qh-004',
    queryTitle: 'Session rollups refresh check',
    durationMs: 1890,
    scannedMb: 74.3,
    costCredits: 1.02,
    optimizedDurationMs: 510,
    optimizedScannedMb: 18.1,
    optimizedCostCredits: 0.28,
    rules: ['rule-001', 'rule-002', 'rule-005'],
  },
  {
    queryId: 'qh-006',
    queryTitle: 'Event volume anomaly scan',
    durationMs: 780,
    scannedMb: 110.6,
    costCredits: 1.48,
    optimizedDurationMs: 218,
    optimizedScannedMb: 14.3,
    optimizedCostCredits: 0.22,
    rules: ['rule-001', 'rule-002', 'rule-006'],
  },
]

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const severityConfig: Record<Severity, { label: string; bg: string; text: string; icon: React.ReactNode; border: string }> = {
  critical: {
    label: 'Critical',
    bg: 'bg-rose-50 dark:bg-rose-950/40',
    text: 'text-rose-700 dark:text-rose-300',
    border: 'border-rose-200 dark:border-rose-800',
    icon: <AlertTriangle size={15} />,
  },
  warning: {
    label: 'Warning',
    bg: 'bg-amber-50 dark:bg-amber-950/40',
    text: 'text-amber-700 dark:text-amber-300',
    border: 'border-amber-200 dark:border-amber-800',
    icon: <AlertTriangle size={15} />,
  },
  info: {
    label: 'Info',
    bg: 'bg-blue-50 dark:bg-blue-950/40',
    text: 'text-blue-700 dark:text-blue-300',
    border: 'border-blue-200 dark:border-blue-800',
    icon: <Info size={15} />,
  },
}

const categoryLabel: Record<Category, string> = {
  index: 'Index',
  scan: 'Data Scan',
  join: 'Join',
  cte: 'Materialization',
  sort: 'Sort',
  subquery: 'Subquery',
  general: 'General',
}

function pctDiff(before: number, after: number) {
  if (before === 0) return 0
  return Math.round(((before - after) / before) * 100)
}

function formatMs(ms: number) {
  if (ms >= 1000) return `${(ms / 1000).toFixed(2)}s`
  return `${ms}ms`
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

const SparkBar: React.FC<{ value: number; max?: number; color?: string }> = ({
  value,
  max = 100,
  color = 'bg-teal-500',
}) => (
  <div className="w-full h-1.5 rounded-full bg-gray-200 dark:bg-dark-600 overflow-hidden">
    <div
      className={`h-full rounded-full transition-all duration-700 ${color}`}
      style={{ width: `${Math.min(100, (value / max) * 100)}%` }}
    />
  </div>
)

const RuleCard: React.FC<{ rule: OptimizationRule }> = ({ rule }) => {
  const [expanded, setExpanded] = useState(false)
  const cfg = severityConfig[rule.severity]

  return (
    <div
      className={`rounded-xl border ${cfg.border} ${cfg.bg} p-4 transition-all duration-200`}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 min-w-0">
          <span className={`mt-0.5 flex-shrink-0 ${cfg.text}`}>{cfg.icon}</span>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <span className={`text-xs font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full ${cfg.bg} ${cfg.text} border ${cfg.border}`}>
                {cfg.label}
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-dark-700 px-2 py-0.5 rounded-full">
                {categoryLabel[rule.category]}
              </span>
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-white text-sm">{rule.title}</h3>
          </div>
        </div>

        {/* Savings pills */}
        <div className="flex-shrink-0 flex gap-3 text-right">
          <div className="hidden sm:flex flex-col items-end">
            <span className="text-base font-bold text-emerald-600 dark:text-emerald-400">
              -{rule.estimatedSpeedupPct}%
            </span>
            <span className="text-[11px] text-gray-400 dark:text-gray-500">latency</span>
          </div>
          <div className="hidden sm:flex flex-col items-end">
            <span className="text-base font-bold text-violet-600 dark:text-violet-400">
              -{rule.estimatedCostSavingPct}%
            </span>
            <span className="text-[11px] text-gray-400 dark:text-gray-500">cost</span>
          </div>
        </div>
      </div>

      {/* Description */}
      <p className="text-sm text-gray-600 dark:text-gray-300 mt-3 leading-relaxed">
        {rule.description}
      </p>

      {/* Recommendation */}
      <div className="mt-3 flex items-start gap-2 rounded-lg bg-white/60 dark:bg-dark-800/60 px-3 py-2.5 border border-gray-200/60 dark:border-dark-600/60">
        <Lightbulb size={14} className="flex-shrink-0 mt-0.5 text-amber-500" />
        <p className="text-sm text-gray-700 dark:text-gray-200 leading-relaxed">{rule.recommendation}</p>
      </div>

      {/* Speed / cost bars */}
      <div className="mt-3 grid grid-cols-2 gap-3">
        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-gray-500 dark:text-gray-400">Speed improvement</span>
            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">{rule.estimatedSpeedupPct}%</span>
          </div>
          <SparkBar value={rule.estimatedSpeedupPct} color="bg-emerald-500" />
        </div>
        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-gray-500 dark:text-gray-400">Cost reduction</span>
            <span className="text-xs font-semibold text-violet-600 dark:text-violet-400">{rule.estimatedCostSavingPct}%</span>
          </div>
          <SparkBar value={rule.estimatedCostSavingPct} color="bg-violet-500" />
        </div>
      </div>

      {/* Affected queries */}
      <div className="mt-3 flex flex-wrap gap-1.5">
        {rule.affectedQueries.map((qid) => (
          <span
            key={qid}
            className="text-[11px] font-mono px-2 py-0.5 rounded bg-gray-100 dark:bg-dark-700 text-gray-600 dark:text-gray-300"
          >
            {qid}
          </span>
        ))}
      </div>

      {/* Expandable code diff */}
      {(rule.exampleBefore || rule.exampleAfter) ? (
        <div className="mt-3 border-t border-gray-200/60 dark:border-dark-600/60 pt-3">
          <button
            onClick={() => setExpanded((v) => !v)}
            className="flex items-center gap-1.5 text-xs font-medium text-teal-600 dark:text-teal-400 hover:text-teal-700 dark:hover:text-teal-300 transition-colors"
          >
            <Code2 size={13} />
            {expanded ? 'Hide' : 'Show'} example
            {expanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
          </button>

          {expanded && (
            <div className="mt-3 grid grid-cols-1 lg:grid-cols-2 gap-3">
              {rule.exampleBefore && (
                <div>
                  <p className="text-[11px] uppercase font-semibold text-rose-500 dark:text-rose-400 mb-1 tracking-wide">Before</p>
                  <pre className="text-[11px] font-mono bg-gray-900 dark:bg-black/40 text-gray-200 rounded-lg p-3 overflow-x-auto whitespace-pre-wrap leading-5">
                    {rule.exampleBefore}
                  </pre>
                </div>
              )}
              {rule.exampleAfter && (
                <div>
                  <p className="text-[11px] uppercase font-semibold text-emerald-500 dark:text-emerald-400 mb-1 tracking-wide">After</p>
                  <pre className="text-[11px] font-mono bg-gray-900 dark:bg-black/40 text-gray-200 rounded-lg p-3 overflow-x-auto whitespace-pre-wrap leading-5">
                    {rule.exampleAfter}
                  </pre>
                </div>
              )}
            </div>
          )}
        </div>
      ) : null}
    </div>
  )
}

const QueryOptimizationRow: React.FC<{ insight: QueryInsightSummary }> = ({ insight }) => {
  const speedPct = pctDiff(insight.durationMs, insight.optimizedDurationMs)
  const scanPct = pctDiff(insight.scannedMb, insight.optimizedScannedMb)
  const costPct = pctDiff(insight.costCredits, insight.optimizedCostCredits)

  return (
    <div className="history-card">
      <div className="flex flex-wrap items-start justify-between gap-2 mb-3">
        <div>
          <h4 className="font-semibold text-gray-900 dark:text-white text-sm">{insight.queryTitle}</h4>
          <span className="text-[11px] font-mono text-gray-400 dark:text-gray-500">{insight.queryId}</span>
        </div>
        <span className="text-xs bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 px-2 py-0.5 rounded-full font-medium">
          {insight.rules.length} fix{insight.rules.length !== 1 ? 'es' : ''} available
        </span>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {/* Duration */}
        <div className="rounded-lg bg-gray-50 dark:bg-dark-900/50 p-3 text-center">
          <div className="flex items-center justify-center gap-1 mb-1">
            <Clock size={12} className="text-gray-400" />
            <span className="text-[11px] text-gray-500 dark:text-gray-400">Duration</span>
          </div>
          <div className="flex items-center justify-center gap-1.5">
            <span className="text-xs text-gray-500 line-through">{formatMs(insight.durationMs)}</span>
            <ArrowRight size={10} className="text-gray-400" />
            <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">{formatMs(insight.optimizedDurationMs)}</span>
          </div>
          <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 mt-1">-{speedPct}%</p>
        </div>

        {/* Scanned */}
        <div className="rounded-lg bg-gray-50 dark:bg-dark-900/50 p-3 text-center">
          <div className="flex items-center justify-center gap-1 mb-1">
            <Cpu size={12} className="text-gray-400" />
            <span className="text-[11px] text-gray-500 dark:text-gray-400">Scanned</span>
          </div>
          <div className="flex items-center justify-center gap-1.5">
            <span className="text-xs text-gray-500 line-through">{insight.scannedMb.toFixed(1)} MB</span>
            <ArrowRight size={10} className="text-gray-400" />
            <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">{insight.optimizedScannedMb.toFixed(1)} MB</span>
          </div>
          <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 mt-1">-{scanPct}%</p>
        </div>

        {/* Cost */}
        <div className="rounded-lg bg-gray-50 dark:bg-dark-900/50 p-3 text-center">
          <div className="flex items-center justify-center gap-1 mb-1">
            <CircleDollarSign size={12} className="text-gray-400" />
            <span className="text-[11px] text-gray-500 dark:text-gray-400">Credits</span>
          </div>
          <div className="flex items-center justify-center gap-1.5">
            <span className="text-xs text-gray-500 line-through">{insight.costCredits.toFixed(2)}</span>
            <ArrowRight size={10} className="text-gray-400" />
            <span className="text-sm font-bold text-violet-600 dark:text-violet-400">{insight.optimizedCostCredits.toFixed(2)}</span>
          </div>
          <p className="text-xs font-semibold text-violet-600 dark:text-violet-400 mt-1">-{costPct}%</p>
        </div>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

type ActiveTab = 'recommendations' | 'query-analysis' | 'execution'

const OptimizationInsights: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('recommendations')
  const [severityFilter, setSeverityFilter] = useState<'all' | Severity>('all')
  const [lastRefreshed] = useState(() => new Date())

  const filteredRules = useMemo(() => {
    if (severityFilter === 'all') return optimizationRules
    return optimizationRules.filter((r) => r.severity === severityFilter)
  }, [severityFilter])

  // Aggregate savings across all query insights
  const aggregateSavings = useMemo(() => {
    const totalCurrentCost = queryInsights.reduce((s, q) => s + q.costCredits, 0)
    const totalOptimizedCost = queryInsights.reduce((s, q) => s + q.optimizedCostCredits, 0)
    const totalCurrentDuration = queryInsights.reduce((s, q) => s + q.durationMs, 0)
    const totalOptimizedDuration = queryInsights.reduce((s, q) => s + q.optimizedDurationMs, 0)
    const totalCurrentScan = queryInsights.reduce((s, q) => s + q.scannedMb, 0)
    const totalOptimizedScan = queryInsights.reduce((s, q) => s + q.optimizedScannedMb, 0)

    return {
      costSavingPct: pctDiff(totalCurrentCost, totalOptimizedCost),
      costSaving: totalCurrentCost - totalOptimizedCost,
      durationSavingPct: pctDiff(totalCurrentDuration, totalOptimizedDuration),
      scanSavingPct: pctDiff(totalCurrentScan, totalOptimizedScan),
      criticalCount: optimizationRules.filter((r) => r.severity === 'critical').length,
      warningCount: optimizationRules.filter((r) => r.severity === 'warning').length,
      infoCount: optimizationRules.filter((r) => r.severity === 'info').length,
    }
  }, [])

  const tabs: { id: ActiveTab; label: string; icon: React.ReactNode }[] = [
    { id: 'recommendations', label: 'Recommendations', icon: <Lightbulb size={15} /> },
    { id: 'query-analysis', label: 'Query Analysis', icon: <TrendingDown size={15} /> },
    { id: 'execution', label: 'Execution Tips', icon: <Zap size={15} /> },
  ]

  return (
    <section className="dashboard-atmosphere p-4 lg:p-8 min-h-[calc(100vh-4rem)]">
      {/* Page header */}
      <div className="mb-8 flex flex-col lg:flex-row lg:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Sparkles size={20} className="text-violet-500" />
            <h1 className="text-3xl lg:text-4xl font-bold tracking-tight text-gray-900 dark:text-white">
              Optimization Insights
            </h1>
          </div>
          <p className="text-gray-600 dark:text-gray-400 max-w-2xl">
            AI-powered analysis of your query history. Actionable recommendations to reduce cost, improve speed, and eliminate unnecessary data scans.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
          <RefreshCw size={12} />
          <span>Analyzed {new Date(lastRefreshed).toLocaleTimeString()}</span>
        </div>
      </div>

      {/* Summary KPI row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="history-card text-center">
          <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-2">Cost Reduction</p>
          <p className="text-3xl font-extrabold text-violet-600 dark:text-violet-400">
            -{aggregateSavings.costSavingPct}%
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Save {aggregateSavings.costSaving.toFixed(2)} credits
          </p>
        </div>
        <div className="history-card text-center">
          <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-2">Speed Gain</p>
          <p className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">
            -{aggregateSavings.durationSavingPct}%
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">avg. latency</p>
        </div>
        <div className="history-card text-center">
          <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-2">Data Scan</p>
          <p className="text-3xl font-extrabold text-amber-600 dark:text-amber-400">
            -{aggregateSavings.scanSavingPct}%
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">MB scanned</p>
        </div>
        <div className="history-card text-center">
          <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-2">Issues Found</p>
          <div className="flex items-center justify-center gap-2 mt-1">
            <span className="text-xs font-bold text-rose-600 dark:text-rose-400">{aggregateSavings.criticalCount} critical</span>
            <span className="text-gray-300 dark:text-gray-600">·</span>
            <span className="text-xs font-bold text-amber-600 dark:text-amber-400">{aggregateSavings.warningCount} warn</span>
            <span className="text-gray-300 dark:text-gray-600">·</span>
            <span className="text-xs font-bold text-blue-600 dark:text-blue-400">{aggregateSavings.infoCount} info</span>
          </div>
          <p className="text-3xl font-extrabold text-gray-900 dark:text-white mt-0.5">
            {optimizationRules.length}
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 bg-gray-100 dark:bg-dark-800 rounded-xl p-1 mb-6 w-fit">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
              activeTab === tab.id
                ? 'bg-white dark:bg-dark-700 text-gray-900 dark:text-white shadow-sm'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab: Recommendations */}
      {activeTab === 'recommendations' && (
        <div>
          {/* Severity filter */}
          <div className="flex flex-wrap items-center gap-2 mb-5">
            {(['all', 'critical', 'warning', 'info'] as const).map((s) => (
              <button
                key={s}
                onClick={() => setSeverityFilter(s)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-colors ${
                  severityFilter === s
                    ? 'bg-teal-600 text-white dark:bg-teal-500'
                    : 'bg-gray-100 text-gray-700 dark:bg-dark-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-dark-600'
                }`}
              >
                {s === 'all' ? `All (${optimizationRules.length})` : `${s} (${optimizationRules.filter((r) => r.severity === s).length})`}
              </button>
            ))}
          </div>

          <div className="flex flex-col gap-4">
            {filteredRules.map((rule) => (
              <RuleCard key={rule.id} rule={rule} />
            ))}
          </div>
        </div>
      )}

      {/* Tab: Query Analysis */}
      {activeTab === 'query-analysis' && (
        <div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-5">
            Per-query estimated improvement after applying all applicable recommendations.
          </p>
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
            {queryInsights.map((insight) => (
              <QueryOptimizationRow key={insight.queryId} insight={insight} />
            ))}
          </div>
        </div>
      )}

      {/* Tab: Execution Tips */}
      {activeTab === 'execution' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {[
            {
              icon: <Zap size={18} className="text-amber-500" />,
              title: 'Leverage query parallelism',
              body: 'For warehouse engines (BigQuery, Redshift, Snowflake), break large sequential scans into partitioned sub-queries that can run in parallel and UNION ALL the results.',
              link: 'https://docs.snowflake.com/en/user-guide/warehouses-parallel-processing',
            },
            {
              icon: <TrendingDown size={18} className="text-violet-500" />,
              title: 'Cluster tables by common filter columns',
              body: 'Cluster or partition physical tables on the most frequently filtered columns (e.g. occurred_at, placed_at). This alone can reduce scanned bytes by 70–90% for time-range queries.',
              link: 'https://docs.snowflake.com/en/user-guide/tables-clustering-keys',
            },
            {
              icon: <RefreshCw size={18} className="text-teal-500" />,
              title: 'Schedule heavy queries off-peak',
              body: 'Move non-interactive aggregation jobs (refresh checks, audit scans) to off-peak hours when warehouse concurrency is low. This reduces contention and improves overall throughput.',
              link: null,
            },
            {
              icon: <CheckCircle2 size={18} className="text-emerald-500" />,
              title: 'Use columnar projection',
              body: 'Select only the columns you need. Avoiding SELECT * on wide tables can reduce I/O by 50–80% in columnar stores since unselected columns are never read from disk.',
              link: null,
            },
            {
              icon: <Code2 size={18} className="text-blue-500" />,
              title: 'Push predicates into subqueries',
              body: 'Ensure WHERE clauses appear as early as possible in the query plan. Place filter conditions inside CTEs and derived tables rather than applying them to the final outer query.',
              link: null,
            },
            {
              icon: <CircleDollarSign size={18} className="text-rose-500" />,
              title: 'Set warehouse auto-suspend aggressively',
              body: 'Configure auto-suspend to 60 seconds for interactive workloads. This avoids idle compute costs for queries that run in short bursts throughout the day.',
              link: null,
            },
          ].map((tip, i) => (
            <div key={i} className="history-card flex gap-4">
              <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-gray-100 dark:bg-dark-700 flex items-center justify-center">
                {tip.icon}
              </div>
              <div className="min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <h4 className="font-semibold text-gray-900 dark:text-white text-sm">{tip.title}</h4>
                  {tip.link ? (
                    <a
                      href={tip.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-shrink-0 text-gray-400 hover:text-teal-500 dark:hover:text-teal-400 transition-colors"
                      aria-label="Documentation"
                    >
                      <ExternalLink size={14} />
                    </a>
                  ) : null}
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-300 mt-1 leading-relaxed">{tip.body}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}

export default OptimizationInsights
