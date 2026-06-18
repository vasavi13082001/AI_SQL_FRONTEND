import React, { useMemo, useState } from 'react'
import {
  Bot,
  Database,
  LineChart as LineChartIcon,
  Users,
  RefreshCw,
  Download,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  Clock,
  Zap,
} from 'lucide-react'
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'

// ─── Static datasets ──────────────────────────────────────────────────────────

const allQueryTrendData: Record<string, Array<{ period: string; total: number; successful: number; failed: number; aiGenerated: number }>> = {
  '2w': [
    { period: 'Mon', total: 1340, successful: 1290, failed: 50, aiGenerated: 830 },
    { period: 'Tue', total: 1480, successful: 1430, failed: 50, aiGenerated: 920 },
    { period: 'Wed', total: 1560, successful: 1510, failed: 50, aiGenerated: 980 },
    { period: 'Thu', total: 1620, successful: 1562, failed: 58, aiGenerated: 1010 },
    { period: 'Fri', total: 1720, successful: 1660, failed: 60, aiGenerated: 1080 },
    { period: 'Sat', total: 880, successful: 852, failed: 28, aiGenerated: 460 },
    { period: 'Sun', total: 740, successful: 716, failed: 24, aiGenerated: 370 },
    { period: 'Mon', total: 1400, successful: 1350, failed: 50, aiGenerated: 890 },
    { period: 'Tue', total: 1540, successful: 1490, failed: 50, aiGenerated: 960 },
    { period: 'Wed', total: 1600, successful: 1550, failed: 50, aiGenerated: 1020 },
    { period: 'Thu', total: 1680, successful: 1620, failed: 60, aiGenerated: 1060 },
    { period: 'Fri', total: 1780, successful: 1718, failed: 62, aiGenerated: 1130 },
    { period: 'Sat', total: 920, successful: 892, failed: 28, aiGenerated: 490 },
    { period: 'Sun', total: 760, successful: 736, failed: 24, aiGenerated: 380 },
  ],
  '8w': [
    { period: 'W1', total: 8200, successful: 7900, failed: 300, aiGenerated: 4920 },
    { period: 'W2', total: 8560, successful: 8264, failed: 296, aiGenerated: 5250 },
    { period: 'W3', total: 8740, successful: 8420, failed: 320, aiGenerated: 5400 },
    { period: 'W4', total: 9030, successful: 8712, failed: 318, aiGenerated: 5620 },
    { period: 'W5', total: 9180, successful: 8868, failed: 312, aiGenerated: 5840 },
    { period: 'W6', total: 9450, successful: 9133, failed: 317, aiGenerated: 6100 },
    { period: 'W7', total: 9620, successful: 9304, failed: 316, aiGenerated: 6280 },
    { period: 'W8', total: 9980, successful: 9658, failed: 322, aiGenerated: 6590 },
  ],
  '6m': [
    { period: 'Jan', total: 31200, successful: 29900, failed: 1300, aiGenerated: 18400 },
    { period: 'Feb', total: 33800, successful: 32400, failed: 1400, aiGenerated: 20600 },
    { period: 'Mar', total: 36400, successful: 34900, failed: 1500, aiGenerated: 22800 },
    { period: 'Apr', total: 38200, successful: 36700, failed: 1500, aiGenerated: 24600 },
    { period: 'May', total: 40100, successful: 38500, failed: 1600, aiGenerated: 26400 },
    { period: 'Jun', total: 42800, successful: 41200, failed: 1600, aiGenerated: 28600 },
  ],
}

const allWarehouseData: Record<string, Array<{ period: string; storageTB: number; computeCredits: number; concurrencyPct: number; costUSD: number }>> = {
  '2w': [
    { period: 'Mon', storageTB: 14.8, computeCredits: 195, concurrencyPct: 71, costUSD: 312 },
    { period: 'Tue', storageTB: 14.9, computeCredits: 210, concurrencyPct: 73, costUSD: 336 },
    { period: 'Wed', storageTB: 15.0, computeCredits: 218, concurrencyPct: 74, costUSD: 349 },
    { period: 'Thu', storageTB: 15.1, computeCredits: 224, concurrencyPct: 75, costUSD: 358 },
    { period: 'Fri', storageTB: 15.2, computeCredits: 231, concurrencyPct: 76, costUSD: 370 },
    { period: 'Sat', storageTB: 15.2, computeCredits: 118, concurrencyPct: 48, costUSD: 189 },
    { period: 'Sun', storageTB: 15.2, computeCredits: 98, concurrencyPct: 39, costUSD: 157 },
    { period: 'Mon', storageTB: 15.3, computeCredits: 202, concurrencyPct: 72, costUSD: 323 },
    { period: 'Tue', storageTB: 15.4, computeCredits: 215, concurrencyPct: 74, costUSD: 344 },
    { period: 'Wed', storageTB: 15.5, computeCredits: 222, concurrencyPct: 75, costUSD: 355 },
    { period: 'Thu', storageTB: 15.5, computeCredits: 228, concurrencyPct: 76, costUSD: 365 },
    { period: 'Fri', storageTB: 15.6, computeCredits: 236, concurrencyPct: 77, costUSD: 378 },
    { period: 'Sat', storageTB: 15.6, computeCredits: 122, concurrencyPct: 49, costUSD: 195 },
    { period: 'Sun', storageTB: 15.6, computeCredits: 101, concurrencyPct: 40, costUSD: 162 },
  ],
  '8w': [
    { period: 'W1', storageTB: 12.8, computeCredits: 1120, concurrencyPct: 64, costUSD: 1792 },
    { period: 'W2', storageTB: 13.1, computeCredits: 1160, concurrencyPct: 67, costUSD: 1856 },
    { period: 'W3', storageTB: 13.5, computeCredits: 1188, concurrencyPct: 66, costUSD: 1901 },
    { period: 'W4', storageTB: 13.9, computeCredits: 1230, concurrencyPct: 69, costUSD: 1968 },
    { period: 'W5', storageTB: 14.2, computeCredits: 1268, concurrencyPct: 71, costUSD: 2029 },
    { period: 'W6', storageTB: 14.6, computeCredits: 1312, concurrencyPct: 73, costUSD: 2099 },
    { period: 'W7', storageTB: 15.1, computeCredits: 1340, concurrencyPct: 74, costUSD: 2144 },
    { period: 'W8', storageTB: 15.6, computeCredits: 1398, concurrencyPct: 76, costUSD: 2237 },
  ],
  '6m': [
    { period: 'Jan', storageTB: 10.4, computeCredits: 4200, concurrencyPct: 58, costUSD: 6720 },
    { period: 'Feb', storageTB: 11.2, computeCredits: 4520, concurrencyPct: 61, costUSD: 7232 },
    { period: 'Mar', storageTB: 12.1, computeCredits: 4890, concurrencyPct: 64, costUSD: 7824 },
    { period: 'Apr', storageTB: 13.0, computeCredits: 5180, concurrencyPct: 67, costUSD: 8288 },
    { period: 'May', storageTB: 14.2, computeCredits: 5460, concurrencyPct: 71, costUSD: 8736 },
    { period: 'Jun', storageTB: 15.6, computeCredits: 5790, concurrencyPct: 76, costUSD: 9264 },
  ],
}

const userEngagementData = [
  { segment: 'Analysts', weeklyActive: 118, avgSessions: 14.2, avgQueryLen: 22, retentionPct: 94 },
  { segment: 'Admins', weeklyActive: 27, avgSessions: 18.4, avgQueryLen: 18, retentionPct: 98 },
  { segment: 'Data Eng.', weeklyActive: 45, avgSessions: 11.6, avgQueryLen: 34, retentionPct: 91 },
  { segment: 'Finance', weeklyActive: 32, avgSessions: 9.1, avgQueryLen: 16, retentionPct: 88 },
  { segment: 'Product', weeklyActive: 41, avgSessions: 10.5, avgQueryLen: 12, retentionPct: 86 },
]

const allAiAccuracyData: Record<string, Array<{ period: string; intentAccuracy: number; sqlValidity: number; resultRelevance: number; confidence: number }>> = {
  '2w': [
    { period: 'Mon', intentAccuracy: 93.6, sqlValidity: 95.1, resultRelevance: 91.8, confidence: 87.2 },
    { period: 'Tue', intentAccuracy: 93.8, sqlValidity: 95.3, resultRelevance: 92.0, confidence: 87.5 },
    { period: 'Wed', intentAccuracy: 94.0, sqlValidity: 95.4, resultRelevance: 92.2, confidence: 87.8 },
    { period: 'Thu', intentAccuracy: 93.9, sqlValidity: 95.2, resultRelevance: 91.9, confidence: 87.4 },
    { period: 'Fri', intentAccuracy: 94.2, sqlValidity: 95.6, resultRelevance: 92.5, confidence: 88.1 },
    { period: 'Sat', intentAccuracy: 94.1, sqlValidity: 95.5, resultRelevance: 92.4, confidence: 87.9 },
    { period: 'Sun', intentAccuracy: 93.7, sqlValidity: 95.1, resultRelevance: 92.0, confidence: 87.3 },
    { period: 'Mon', intentAccuracy: 94.1, sqlValidity: 95.7, resultRelevance: 92.4, confidence: 88.0 },
    { period: 'Tue', intentAccuracy: 94.2, sqlValidity: 95.8, resultRelevance: 92.6, confidence: 88.3 },
    { period: 'Wed', intentAccuracy: 94.3, sqlValidity: 96.0, resultRelevance: 92.7, confidence: 88.5 },
    { period: 'Thu', intentAccuracy: 94.2, sqlValidity: 95.9, resultRelevance: 92.5, confidence: 88.2 },
    { period: 'Fri', intentAccuracy: 94.5, sqlValidity: 96.1, resultRelevance: 92.9, confidence: 88.7 },
    { period: 'Sat', intentAccuracy: 94.4, sqlValidity: 96.0, resultRelevance: 92.8, confidence: 88.5 },
    { period: 'Sun', intentAccuracy: 94.1, sqlValidity: 95.8, resultRelevance: 92.5, confidence: 88.1 },
  ],
  '8w': [
    { period: 'W1', intentAccuracy: 91.4, sqlValidity: 93.2, resultRelevance: 89.6, confidence: 84.1 },
    { period: 'W2', intentAccuracy: 91.9, sqlValidity: 93.7, resultRelevance: 90.1, confidence: 84.8 },
    { period: 'W3', intentAccuracy: 92.4, sqlValidity: 94.1, resultRelevance: 90.5, confidence: 85.4 },
    { period: 'W4', intentAccuracy: 92.8, sqlValidity: 94.4, resultRelevance: 90.9, confidence: 86.0 },
    { period: 'W5', intentAccuracy: 93.1, sqlValidity: 94.8, resultRelevance: 91.3, confidence: 86.6 },
    { period: 'W6', intentAccuracy: 93.6, sqlValidity: 95.1, resultRelevance: 91.8, confidence: 87.2 },
    { period: 'W7', intentAccuracy: 94.0, sqlValidity: 95.6, resultRelevance: 92.1, confidence: 87.9 },
    { period: 'W8', intentAccuracy: 94.3, sqlValidity: 96.0, resultRelevance: 92.7, confidence: 88.5 },
  ],
  '6m': [
    { period: 'Jan', intentAccuracy: 88.2, sqlValidity: 90.4, resultRelevance: 86.8, confidence: 80.1 },
    { period: 'Feb', intentAccuracy: 89.6, sqlValidity: 91.8, resultRelevance: 88.2, confidence: 82.0 },
    { period: 'Mar', intentAccuracy: 91.0, sqlValidity: 92.9, resultRelevance: 89.5, confidence: 83.8 },
    { period: 'Apr', intentAccuracy: 92.1, sqlValidity: 93.8, resultRelevance: 90.6, confidence: 85.5 },
    { period: 'May', intentAccuracy: 93.4, sqlValidity: 95.0, resultRelevance: 91.9, confidence: 87.1 },
    { period: 'Jun', intentAccuracy: 94.3, sqlValidity: 96.0, resultRelevance: 92.7, confidence: 88.5 },
  ],
}

const queryTypeDistribution = [
  { name: 'SELECT', value: 5840, color: '#0ea5e9' },
  { name: 'JOIN', value: 2210, color: '#6366f1' },
  { name: 'AGGREGATE', value: 1180, color: '#10b981' },
  { name: 'INSERT/UPDATE', value: 430, color: '#f59e0b' },
  { name: 'DDL', value: 190, color: '#ef4444' },
  { name: 'WITH/CTE', value: 130, color: '#8b5cf6' },
]

const latencyData = [
  { period: 'W1', p50: 142, p90: 380, p99: 820 },
  { period: 'W2', p50: 138, p90: 368, p99: 795 },
  { period: 'W3', p50: 135, p90: 355, p99: 772 },
  { period: 'W4', p50: 131, p90: 341, p99: 748 },
  { period: 'W5', p50: 128, p90: 329, p99: 720 },
  { period: 'W6', p50: 124, p90: 315, p99: 694 },
  { period: 'W7', p50: 121, p90: 301, p99: 668 },
  { period: 'W8', p50: 117, p90: 286, p99: 641 },
]

const errorBreakdownData = [
  { type: 'Syntax Error', count: 112, color: '#ef4444' },
  { type: 'Timeout', count: 78, color: '#f97316' },
  { type: 'Permission', count: 54, color: '#f59e0b' },
  { type: 'Table Not Found', count: 42, color: '#eab308' },
  { type: 'Type Mismatch', count: 28, color: '#84cc16' },
  { type: 'Other', count: 8, color: '#94a3b8' },
]

const aiRadarData = [
  { metric: 'Intent Accuracy', score: 94.3 },
  { metric: 'SQL Validity', score: 96.0 },
  { metric: 'Result Relevance', score: 92.7 },
  { metric: 'Confidence', score: 88.5 },
  { metric: 'Response Speed', score: 91.2 },
  { metric: 'Context Retention', score: 89.8 },
]

const topUsersData = [
  { user: 'sarah.kim@corp.com', role: 'Analyst', queries: 842, aiQueries: 691, successRate: 98.1, avgLatencyMs: 118 },
  { user: 'marcus.chen@corp.com', role: 'Data Eng.', queries: 764, aiQueries: 412, successRate: 97.4, avgLatencyMs: 134 },
  { user: 'priya.patel@corp.com', role: 'Admin', queries: 710, aiQueries: 620, successRate: 99.2, avgLatencyMs: 109 },
  { user: 'derek.walsh@corp.com', role: 'Analyst', queries: 638, aiQueries: 524, successRate: 97.8, avgLatencyMs: 126 },
  { user: 'alex.torres@corp.com', role: 'Finance', queries: 582, aiQueries: 398, successRate: 96.9, avgLatencyMs: 142 },
  { user: 'nina.johnson@corp.com', role: 'Product', queries: 511, aiQueries: 340, successRate: 95.8, avgLatencyMs: 155 },
  { user: 'james.liu@corp.com', role: 'Data Eng.', queries: 490, aiQueries: 210, successRate: 96.1, avgLatencyMs: 148 },
]

// ─── Types ────────────────────────────────────────────────────────────────────

type TimeRange = '2w' | '8w' | '6m'

// ─── Helpers ──────────────────────────────────────────────────────────────────

const fmt = (v: number) => new Intl.NumberFormat().format(v)
const changePct = (start: number, end: number) =>
  start === 0 ? 0 : Number((((end - start) / start) * 100).toFixed(1))

// ─── Sub-components ───────────────────────────────────────────────────────────

const SectionHeader: React.FC<{ title: string; subtitle?: string }> = ({ title, subtitle }) => (
  <div className="mb-6">
    <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">{title}</h2>
    {subtitle && <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{subtitle}</p>}
  </div>
)

const ChartCard: React.FC<{ title: string; subtitle?: string; children: React.ReactNode; className?: string }> = ({
  title,
  subtitle,
  children,
  className = '',
}) => (
  <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 ${className}`}>
    <div className="mb-4">
      <h3 className="text-base font-semibold text-gray-800 dark:text-gray-100">{title}</h3>
      {subtitle && <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{subtitle}</p>}
    </div>
    {children}
  </div>
)

const DarkTooltip: React.FC<{
  active?: boolean
  payload?: Array<{ name: string; value: number; color: string }>
  label?: string
  formatter?: (v: number) => string
}> = ({ active, payload, label, formatter }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-gray-900 text-white text-xs rounded-lg px-3 py-2 shadow-xl border border-gray-700">
      {label && <p className="font-semibold mb-1 text-gray-300">{label}</p>}
      {payload.map((entry, i) => (
        <p key={i} style={{ color: entry.color }} className="leading-5">
          {entry.name}: <span className="font-semibold">{formatter ? formatter(entry.value) : entry.value}</span>
        </p>
      ))}
    </div>
  )
}

interface StatCardProps {
  label: string
  value: string
  change?: number
  icon: React.ReactNode
  accent: string
}

const StatCard: React.FC<StatCardProps> = ({ label, value, change, icon, accent }) => {
  const isPos = (change ?? 0) >= 0
  return (
    <div className={`rounded-xl p-5 border ${accent} bg-white dark:bg-gray-800 shadow-sm`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">{label}</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
        </div>
        <div className="p-2.5 rounded-lg bg-gray-50 dark:bg-gray-700">{icon}</div>
      </div>
      {change !== undefined && (
        <div className={`flex items-center gap-1 mt-3 text-xs font-medium ${isPos ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500 dark:text-red-400'}`}>
          {isPos ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
          {isPos ? '+' : ''}{change}% vs period start
        </div>
      )}
    </div>
  )
}

const roleColors: Record<string, string> = {
  Analyst: 'bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300',
  Admin: 'bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300',
  'Data Eng.': 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
  Finance: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
  Product: 'bg-pink-100 text-pink-700 dark:bg-pink-900/40 dark:text-pink-300',
}

// ─── Main component ───────────────────────────────────────────────────────────

const AdminAnalyticsDashboard: React.FC = () => {
  const [timeRange, setTimeRange] = useState<TimeRange>('8w')
  const [lastRefreshed] = useState(() => new Date().toLocaleTimeString())

  const queryTrendData = allQueryTrendData[timeRange]
  const warehouseUsageData = allWarehouseData[timeRange]
  const aiAccuracyData = allAiAccuracyData[timeRange]

  const kpis = useMemo(() => {
    const last = queryTrendData[queryTrendData.length - 1]
    const first = queryTrendData[0]
    const lastW = warehouseUsageData[warehouseUsageData.length - 1]
    const firstW = warehouseUsageData[0]
    const lastA = aiAccuracyData[aiAccuracyData.length - 1]
    const firstA = aiAccuracyData[0]
    const totalUsers = userEngagementData.reduce((s, r) => s + r.weeklyActive, 0)
    const avgAccuracy = (lastA.intentAccuracy + lastA.sqlValidity + lastA.resultRelevance) / 3
    return {
      totalQueries: { value: fmt(last.total), change: changePct(first.total, last.total) },
      failRate: { value: `${((last.failed / last.total) * 100).toFixed(1)}%`, change: changePct(first.failed / first.total, last.failed / last.total) * -1 },
      concurrency: { value: `${lastW.concurrencyPct}%`, change: changePct(firstW.concurrencyPct, lastW.concurrencyPct) },
      activeUsers: { value: fmt(totalUsers), change: null as number | null },
      aiAccuracy: { value: `${avgAccuracy.toFixed(1)}%`, change: changePct(firstA.intentAccuracy, lastA.intentAccuracy) },
      computeCost: { value: `$${fmt(lastW.costUSD)}`, change: changePct(firstW.costUSD, lastW.costUSD) },
    }
  }, [queryTrendData, warehouseUsageData, aiAccuracyData])

  const timeRangeLabels: Record<TimeRange, string> = { '2w': 'Last 2 Weeks', '8w': 'Last 8 Weeks', '6m': 'Last 6 Months' }

  return (
    <div className="p-4 lg:p-8 min-h-[calc(100vh-4rem)] bg-gray-50 dark:bg-gray-900">

      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
            Admin Analytics Dashboard
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Query trends · Warehouse usage · User engagement · AI accuracy
          </p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          {/* Time range selector */}
          <div className="flex rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden text-sm font-medium">
            {(['2w', '8w', '6m'] as TimeRange[]).map((r) => (
              <button
                key={r}
                onClick={() => setTimeRange(r)}
                className={`px-4 py-2 transition-colors ${
                  timeRange === r
                    ? 'bg-indigo-600 text-white'
                    : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
              >
                {timeRangeLabels[r]}
              </button>
            ))}
          </div>
          <button className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors">
            <RefreshCw className="w-4 h-4" />
            <span className="hidden sm:inline">Refreshed {lastRefreshed}</span>
          </button>
          <button className="flex items-center gap-1.5 px-3 py-2 text-sm text-gray-600 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
            <Download className="w-4 h-4" />
            Export
          </button>
        </div>
      </div>

      {/* ── KPI Cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
        <StatCard
          label="Total Queries"
          value={kpis.totalQueries.value}
          change={kpis.totalQueries.change}
          accent="border-cyan-200 dark:border-cyan-800"
          icon={<LineChartIcon className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />}
        />
        <StatCard
          label="Failure Rate"
          value={kpis.failRate.value}
          change={kpis.failRate.change}
          accent="border-red-200 dark:border-red-800"
          icon={<AlertTriangle className="w-5 h-5 text-red-500 dark:text-red-400" />}
        />
        <StatCard
          label="Concurrency"
          value={kpis.concurrency.value}
          change={kpis.concurrency.change}
          accent="border-amber-200 dark:border-amber-800"
          icon={<Database className="w-5 h-5 text-amber-600 dark:text-amber-400" />}
        />
        <StatCard
          label="Active Users"
          value={kpis.activeUsers.value}
          accent="border-emerald-200 dark:border-emerald-800"
          icon={<Users className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />}
        />
        <StatCard
          label="AI Accuracy"
          value={kpis.aiAccuracy.value}
          change={kpis.aiAccuracy.change}
          accent="border-violet-200 dark:border-violet-800"
          icon={<Bot className="w-5 h-5 text-violet-600 dark:text-violet-400" />}
        />
        <StatCard
          label="Compute Cost"
          value={kpis.computeCost.value}
          change={kpis.computeCost.change}
          accent="border-pink-200 dark:border-pink-800"
          icon={<Zap className="w-5 h-5 text-pink-600 dark:text-pink-400" />}
        />
      </div>

      {/* ── Section 1: Query Trends ── */}
      <SectionHeader title="Query Trends" subtitle="Total, successful, failed, and AI-generated queries over time" />
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-10">
        <ChartCard title="Query Volume Over Time" subtitle="Total vs successful vs failed">
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={queryTrendData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="period" tick={{ fontSize: 11, fill: '#6b7280' }} />
              <YAxis tick={{ fontSize: 11, fill: '#6b7280' }} />
              <Tooltip content={<DarkTooltip formatter={fmt} />} />
              <Legend iconSize={10} wrapperStyle={{ fontSize: 12 }} />
              <Line type="monotone" dataKey="total" name="Total" stroke="#0891b2" strokeWidth={2.5} dot={false} activeDot={{ r: 5 }} />
              <Line type="monotone" dataKey="successful" name="Successful" stroke="#10b981" strokeWidth={2} dot={false} activeDot={{ r: 5 }} />
              <Line type="monotone" dataKey="failed" name="Failed" stroke="#ef4444" strokeWidth={2} dot={false} activeDot={{ r: 5 }} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="AI-Generated vs Manual Queries" subtitle="Adoption of AI query generation over time">
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={queryTrendData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
              <defs>
                <linearGradient id="aiGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.05} />
                </linearGradient>
                <linearGradient id="manualGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0.05} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="period" tick={{ fontSize: 11, fill: '#6b7280' }} />
              <YAxis tick={{ fontSize: 11, fill: '#6b7280' }} />
              <Tooltip content={<DarkTooltip formatter={fmt} />} />
              <Legend iconSize={10} wrapperStyle={{ fontSize: 12 }} />
              <Area type="monotone" dataKey="aiGenerated" name="AI Generated" stroke="#8b5cf6" strokeWidth={2} fill="url(#aiGrad)" />
              <Area
                type="monotone"
                dataKey="total"
                name="Total"
                stroke="#0ea5e9"
                strokeWidth={2}
                fill="url(#manualGrad)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* ── Section 2: Warehouse Usage ── */}
      <SectionHeader title="Warehouse Usage" subtitle="Storage growth, compute credits, concurrency, and cost trends" />
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-10">
        <ChartCard title="Compute Credits & Storage" subtitle="Resource consumption over time">
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={warehouseUsageData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
              <defs>
                <linearGradient id="creditGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.05} />
                </linearGradient>
                <linearGradient id="storageGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0.05} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="period" tick={{ fontSize: 11, fill: '#6b7280' }} />
              <YAxis tick={{ fontSize: 11, fill: '#6b7280' }} />
              <Tooltip content={<DarkTooltip />} />
              <Legend iconSize={10} wrapperStyle={{ fontSize: 12 }} />
              <Area type="monotone" dataKey="computeCredits" name="Compute Credits" stroke="#f59e0b" strokeWidth={2} fill="url(#creditGrad)" />
              <Area type="monotone" dataKey="storageTB" name="Storage (TB)" stroke="#6366f1" strokeWidth={2} fill="url(#storageGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Concurrency & Estimated Cost" subtitle="Warehouse utilization and daily/weekly cost">
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={warehouseUsageData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="period" tick={{ fontSize: 11, fill: '#6b7280' }} />
              <YAxis yAxisId="left" tick={{ fontSize: 11, fill: '#6b7280' }} />
              <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11, fill: '#6b7280' }} />
              <Tooltip content={<DarkTooltip />} />
              <Legend iconSize={10} wrapperStyle={{ fontSize: 12 }} />
              <Bar yAxisId="left" dataKey="concurrencyPct" name="Concurrency (%)" fill="#06b6d4" radius={[4, 4, 0, 0]} />
              <Bar yAxisId="right" dataKey="costUSD" name="Cost (USD)" fill="#f97316" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* ── Section 3: User Engagement ── */}
      <SectionHeader title="User Engagement" subtitle="Active users by segment, session depth, and retention" />
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-10">
        <ChartCard title="Weekly Active Users by Segment">
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={userEngagementData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="segment" tick={{ fontSize: 11, fill: '#6b7280' }} />
              <YAxis tick={{ fontSize: 11, fill: '#6b7280' }} />
              <Tooltip content={<DarkTooltip />} />
              <Legend iconSize={10} wrapperStyle={{ fontSize: 12 }} />
              <Bar dataKey="weeklyActive" name="Weekly Active" fill="#22c55e" radius={[4, 4, 0, 0]} />
              <Bar dataKey="avgSessions" name="Avg Sessions/User" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Avg Query Length & Retention by Segment" subtitle="Query complexity and stickiness per user type">
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={userEngagementData} layout="vertical" margin={{ top: 5, right: 30, left: 60, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis type="number" tick={{ fontSize: 11, fill: '#6b7280' }} />
              <YAxis dataKey="segment" type="category" tick={{ fontSize: 11, fill: '#6b7280' }} width={72} />
              <Tooltip content={<DarkTooltip />} />
              <Legend iconSize={10} wrapperStyle={{ fontSize: 12 }} />
              <Bar dataKey="avgQueryLen" name="Avg Query Length" fill="#a78bfa" radius={[0, 4, 4, 0]} />
              <Bar dataKey="retentionPct" name="Retention %" fill="#34d399" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* ── Section 4: AI Accuracy ── */}
      <SectionHeader title="AI Accuracy Metrics" subtitle="Intent detection, SQL validity, relevance, and confidence over time" />
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-10">
        <ChartCard title="AI Quality Trends" subtitle="All metrics over selected period" className="xl:col-span-2">
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={aiAccuracyData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="period" tick={{ fontSize: 11, fill: '#6b7280' }} />
              <YAxis domain={[80, 100]} tick={{ fontSize: 11, fill: '#6b7280' }} />
              <Tooltip content={<DarkTooltip formatter={(v) => `${v.toFixed(1)}%`} />} />
              <Legend iconSize={10} wrapperStyle={{ fontSize: 12 }} />
              <Line type="monotone" dataKey="intentAccuracy" name="Intent Accuracy" stroke="#8b5cf6" strokeWidth={2.5} dot={false} activeDot={{ r: 5 }} />
              <Line type="monotone" dataKey="sqlValidity" name="SQL Validity" stroke="#0ea5e9" strokeWidth={2.5} dot={false} activeDot={{ r: 5 }} />
              <Line type="monotone" dataKey="resultRelevance" name="Result Relevance" stroke="#14b8a6" strokeWidth={2.5} dot={false} activeDot={{ r: 5 }} />
              <Line type="monotone" dataKey="confidence" name="Confidence" stroke="#f59e0b" strokeWidth={2} strokeDasharray="4 2" dot={false} activeDot={{ r: 5 }} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="AI Model Radar" subtitle="Latest period scores">
          <ResponsiveContainer width="100%" height={280}>
            <RadarChart data={aiRadarData} margin={{ top: 10, right: 20, left: 20, bottom: 10 }}>
              <PolarGrid stroke="#e5e7eb" />
              <PolarAngleAxis dataKey="metric" tick={{ fontSize: 10, fill: '#6b7280' }} />
              <PolarRadiusAxis angle={30} domain={[80, 100]} tick={{ fontSize: 9, fill: '#9ca3af' }} />
              <Radar name="Score" dataKey="score" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.25} strokeWidth={2} />
              <Tooltip content={<DarkTooltip formatter={(v) => `${v.toFixed(1)}%`} />} />
            </RadarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* ── Section 5: Query Distribution & Latency ── */}
      <SectionHeader title="Query Distribution & Performance" subtitle="Query type breakdown and latency percentiles" />
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-10">
        <ChartCard title="Query Type Distribution" subtitle="Breakdown by SQL operation type (last period)">
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={queryTypeDistribution}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={65}
                outerRadius={100}
                paddingAngle={3}
                label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                labelLine={{ stroke: '#9ca3af', strokeWidth: 1 }}
              >
                {queryTypeDistribution.map((entry, index) => (
                  <Cell key={index} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<DarkTooltip formatter={fmt} />} />
              <Legend iconSize={10} wrapperStyle={{ fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Query Latency Percentiles (ms)" subtitle="p50 / p90 / p99 response times — 8-week trend">
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={latencyData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="period" tick={{ fontSize: 11, fill: '#6b7280' }} />
              <YAxis tick={{ fontSize: 11, fill: '#6b7280' }} />
              <Tooltip content={<DarkTooltip formatter={(v) => `${v} ms`} />} />
              <Legend iconSize={10} wrapperStyle={{ fontSize: 12 }} />
              <Line type="monotone" dataKey="p50" name="p50" stroke="#10b981" strokeWidth={2.5} dot={false} activeDot={{ r: 5 }} />
              <Line type="monotone" dataKey="p90" name="p90" stroke="#f59e0b" strokeWidth={2.5} dot={false} activeDot={{ r: 5 }} />
              <Line type="monotone" dataKey="p99" name="p99" stroke="#ef4444" strokeWidth={2.5} dot={false} activeDot={{ r: 5 }} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* ── Section 6: Error Analysis & Top Users ── */}
      <SectionHeader title="Error Analysis & Top Users" subtitle="Error breakdown and most active users this period" />
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-10">
        <ChartCard title="Error Type Breakdown" subtitle="Categorised query failures (last 8 weeks)">
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={errorBreakdownData} layout="vertical" margin={{ top: 5, right: 30, left: 100, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis type="number" tick={{ fontSize: 11, fill: '#6b7280' }} />
              <YAxis dataKey="type" type="category" tick={{ fontSize: 11, fill: '#6b7280' }} width={100} />
              <Tooltip content={<DarkTooltip formatter={fmt} />} />
              {errorBreakdownData.map((entry, index) => (
                <Bar key={index} dataKey="count" name="Count" fill={entry.color} radius={[0, 4, 4, 0]} hide={index > 0} />
              ))}
              <Bar dataKey="count" name="Error Count" radius={[0, 4, 4, 0]}>
                {errorBreakdownData.map((entry, index) => (
                  <Cell key={index} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Top Users Table */}
        <ChartCard title="Top Active Users" subtitle="By query volume this period">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 dark:border-gray-700">
                  <th className="text-left py-2 pr-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">User</th>
                  <th className="text-right py-2 px-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Queries</th>
                  <th className="text-right py-2 px-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">AI %</th>
                  <th className="text-right py-2 px-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Success</th>
                  <th className="text-right py-2 pl-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                    <span className="flex items-center justify-end gap-1"><Clock className="w-3 h-3" /> p50</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {topUsersData.map((row, i) => (
                  <tr key={i} className="border-b border-gray-50 dark:border-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                    <td className="py-2.5 pr-3">
                      <div className="font-medium text-gray-800 dark:text-gray-200 truncate max-w-[160px]">{row.user}</div>
                      <span className={`inline-block mt-0.5 text-xs px-1.5 py-0.5 rounded font-medium ${roleColors[row.role] ?? 'bg-gray-100 text-gray-600'}`}>
                        {row.role}
                      </span>
                    </td>
                    <td className="py-2.5 px-2 text-right font-semibold text-gray-700 dark:text-gray-300">{fmt(row.queries)}</td>
                    <td className="py-2.5 px-2 text-right text-gray-600 dark:text-gray-400">
                      {((row.aiQueries / row.queries) * 100).toFixed(0)}%
                    </td>
                    <td className="py-2.5 px-2 text-right">
                      <span className={`font-medium ${row.successRate >= 98 ? 'text-emerald-600 dark:text-emerald-400' : row.successRate >= 96 ? 'text-amber-600 dark:text-amber-400' : 'text-red-500 dark:text-red-400'}`}>
                        {row.successRate}%
                      </span>
                    </td>
                    <td className="py-2.5 pl-2 text-right text-gray-600 dark:text-gray-400">{row.avgLatencyMs} ms</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </ChartCard>
      </div>

      {/* ── Footer ── */}
      <div className="flex items-center gap-2 text-xs text-gray-400 dark:text-gray-500 pt-2 border-t border-gray-200 dark:border-gray-700">
        <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
        All systems operational · Last refreshed {lastRefreshed} · Data shown for {timeRangeLabels[timeRange].toLowerCase()}
      </div>
    </div>
  )
}

export default AdminAnalyticsDashboard