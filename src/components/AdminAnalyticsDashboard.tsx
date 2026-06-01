import React, { useMemo } from 'react'
import { Bot, Database, LineChart, Users } from 'lucide-react'
import { AreaChartComponent } from './charts/AreaChartComponent'
import { BarChartComponent } from './charts/BarChartComponent'
import { KPICard } from './charts/KPICard'
import { LineChartComponent } from './charts/LineChartComponent'

const queryTrendData = [
  { week: 'W1', totalQueries: 8200, successfulQueries: 7900, failedQueries: 300 },
  { week: 'W2', totalQueries: 8560, successfulQueries: 8264, failedQueries: 296 },
  { week: 'W3', totalQueries: 8740, successfulQueries: 8420, failedQueries: 320 },
  { week: 'W4', totalQueries: 9030, successfulQueries: 8712, failedQueries: 318 },
  { week: 'W5', totalQueries: 9180, successfulQueries: 8868, failedQueries: 312 },
  { week: 'W6', totalQueries: 9450, successfulQueries: 9133, failedQueries: 317 },
  { week: 'W7', totalQueries: 9620, successfulQueries: 9304, failedQueries: 316 },
  { week: 'W8', totalQueries: 9980, successfulQueries: 9658, failedQueries: 322 },
]

const warehouseUsageData = [
  { week: 'W1', storageTB: 12.8, computeCredits: 1120, concurrencyPct: 64 },
  { week: 'W2', storageTB: 13.1, computeCredits: 1160, concurrencyPct: 67 },
  { week: 'W3', storageTB: 13.5, computeCredits: 1188, concurrencyPct: 66 },
  { week: 'W4', storageTB: 13.9, computeCredits: 1230, concurrencyPct: 69 },
  { week: 'W5', storageTB: 14.2, computeCredits: 1268, concurrencyPct: 71 },
  { week: 'W6', storageTB: 14.6, computeCredits: 1312, concurrencyPct: 73 },
  { week: 'W7', storageTB: 15.1, computeCredits: 1340, concurrencyPct: 74 },
  { week: 'W8', storageTB: 15.6, computeCredits: 1398, concurrencyPct: 76 },
]

const userEngagementData = [
  { segment: 'Analysts', weeklyActiveUsers: 118, avgSessionsPerUser: 14.2 },
  { segment: 'Admins', weeklyActiveUsers: 27, avgSessionsPerUser: 18.4 },
  { segment: 'Data Engineers', weeklyActiveUsers: 45, avgSessionsPerUser: 11.6 },
  { segment: 'Finance', weeklyActiveUsers: 32, avgSessionsPerUser: 9.1 },
  { segment: 'Product', weeklyActiveUsers: 41, avgSessionsPerUser: 10.5 },
]

const aiAccuracyData = [
  { week: 'W1', intentAccuracy: 91.4, sqlValidity: 93.2, resultRelevance: 89.6 },
  { week: 'W2', intentAccuracy: 91.9, sqlValidity: 93.7, resultRelevance: 90.1 },
  { week: 'W3', intentAccuracy: 92.4, sqlValidity: 94.1, resultRelevance: 90.5 },
  { week: 'W4', intentAccuracy: 92.8, sqlValidity: 94.4, resultRelevance: 90.9 },
  { week: 'W5', intentAccuracy: 93.1, sqlValidity: 94.8, resultRelevance: 91.3 },
  { week: 'W6', intentAccuracy: 93.6, sqlValidity: 95.1, resultRelevance: 91.8 },
  { week: 'W7', intentAccuracy: 94.0, sqlValidity: 95.6, resultRelevance: 92.1 },
  { week: 'W8', intentAccuracy: 94.3, sqlValidity: 96.0, resultRelevance: 92.7 },
]

const formatNumber = (value: number) => new Intl.NumberFormat().format(value)

const calculateChangePct = (start: number, end: number) => {
  if (start === 0) {
    return 0
  }

  return Number((((end - start) / start) * 100).toFixed(1))
}

const AdminAnalyticsDashboard: React.FC = () => {
  const kpis = useMemo(() => {
    const latestQueryWeek = queryTrendData[queryTrendData.length - 1]
    const firstQueryWeek = queryTrendData[0]

    const latestWarehouseWeek = warehouseUsageData[warehouseUsageData.length - 1]
    const firstWarehouseWeek = warehouseUsageData[0]

    const latestAccuracyWeek = aiAccuracyData[aiAccuracyData.length - 1]
    const firstAccuracyWeek = aiAccuracyData[0]

    const totalWeeklyUsers = userEngagementData.reduce((sum, item) => sum + item.weeklyActiveUsers, 0)
    const avgSessionsPerUser =
      userEngagementData.reduce((sum, item) => sum + item.avgSessionsPerUser, 0) / userEngagementData.length

    const avgAccuracy =
      (latestAccuracyWeek.intentAccuracy + latestAccuracyWeek.sqlValidity + latestAccuracyWeek.resultRelevance) / 3

    return {
      queries: {
        value: formatNumber(latestQueryWeek.totalQueries),
        trend: calculateChangePct(firstQueryWeek.totalQueries, latestQueryWeek.totalQueries),
      },
      warehouse: {
        value: `${latestWarehouseWeek.concurrencyPct}%`,
        trend: calculateChangePct(firstWarehouseWeek.concurrencyPct, latestWarehouseWeek.concurrencyPct),
      },
      users: {
        value: formatNumber(totalWeeklyUsers),
        trend: Number(avgSessionsPerUser.toFixed(1)),
      },
      aiAccuracy: {
        value: `${avgAccuracy.toFixed(1)}%`,
        trend: calculateChangePct(firstAccuracyWeek.intentAccuracy, latestAccuracyWeek.intentAccuracy),
      },
    }
  }, [])

  return (
    <div className="dashboard-atmosphere p-4 lg:p-8 min-h-[calc(100vh-4rem)]">
      <div className="mb-8">
        <h1 className="text-3xl lg:text-4xl font-bold tracking-tight text-gray-900 dark:text-white mb-2">
          Admin Analytics Dashboard
        </h1>
        <p className="text-gray-600 dark:text-gray-400 max-w-3xl">
          Monitor operational signals across query volume, warehouse utilization, user engagement, and AI quality in one admin view.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
        <KPICard
          title="Weekly Query Volume"
          value={kpis.queries.value}
          icon={<LineChart className="w-6 h-6" />}
          trend={{
            value: kpis.queries.trend,
            isPositive: kpis.queries.trend >= 0,
            label: 'vs week 1',
          }}
          backgroundColor="bg-gradient-to-br from-cyan-50 to-cyan-100"
          iconColor="text-cyan-600"
          textColor="text-cyan-700"
        />

        <KPICard
          title="Warehouse Concurrency"
          value={kpis.warehouse.value}
          icon={<Database className="w-6 h-6" />}
          trend={{
            value: kpis.warehouse.trend,
            isPositive: kpis.warehouse.trend >= 0,
            label: 'usage growth',
          }}
          backgroundColor="bg-gradient-to-br from-amber-50 to-amber-100"
          iconColor="text-amber-600"
          textColor="text-amber-700"
        />

        <KPICard
          title="Weekly Active Users"
          value={kpis.users.value}
          icon={<Users className="w-6 h-6" />}
          trend={{
            value: kpis.users.trend,
            isPositive: true,
            label: 'avg sessions/user',
          }}
          backgroundColor="bg-gradient-to-br from-emerald-50 to-emerald-100"
          iconColor="text-emerald-600"
          textColor="text-emerald-700"
        />

        <KPICard
          title="AI Accuracy Score"
          value={kpis.aiAccuracy.value}
          icon={<Bot className="w-6 h-6" />}
          trend={{
            value: kpis.aiAccuracy.trend,
            isPositive: kpis.aiAccuracy.trend >= 0,
            label: 'intent trend',
          }}
          backgroundColor="bg-gradient-to-br from-violet-50 to-violet-100"
          iconColor="text-violet-600"
          textColor="text-violet-700"
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <LineChartComponent
          title="Query Trends"
          data={queryTrendData}
          xAxisKey="week"
          lines={[
            { key: 'totalQueries', name: 'Total Queries', color: '#0891b2', strokeWidth: 2.5 },
            { key: 'successfulQueries', name: 'Successful', color: '#10b981', strokeWidth: 2 },
            { key: 'failedQueries', name: 'Failed', color: '#ef4444', strokeWidth: 2 },
          ]}
          formatTooltip={(value) => formatNumber(value)}
        />

        <AreaChartComponent
          title="Warehouse Usage"
          data={warehouseUsageData}
          xAxisKey="week"
          areas={[
            { key: 'storageTB', name: 'Storage (TB)', color: '#6366f1', fillOpacity: 0.32 },
            { key: 'computeCredits', name: 'Compute Credits', color: '#f59e0b', fillOpacity: 0.28 },
            { key: 'concurrencyPct', name: 'Concurrency (%)', color: '#06b6d4', fillOpacity: 0.24 },
          ]}
          formatTooltip={(value) => formatNumber(value)}
          stacked={false}
        />

        <BarChartComponent
          title="User Engagement"
          data={userEngagementData}
          xAxisKey="segment"
          bars={[
            { key: 'weeklyActiveUsers', name: 'Weekly Active Users', color: '#22c55e' },
            { key: 'avgSessionsPerUser', name: 'Avg Sessions/User', color: '#3b82f6' },
          ]}
          layout="horizontal"
          formatTooltip={(value) => value.toFixed(1)}
        />

        <LineChartComponent
          title="AI Accuracy Metrics"
          data={aiAccuracyData}
          xAxisKey="week"
          lines={[
            { key: 'intentAccuracy', name: 'Intent Accuracy', color: '#8b5cf6', strokeWidth: 2.5 },
            { key: 'sqlValidity', name: 'SQL Validity', color: '#0ea5e9', strokeWidth: 2.5 },
            { key: 'resultRelevance', name: 'Result Relevance', color: '#14b8a6', strokeWidth: 2.5 },
          ]}
          formatTooltip={(value) => `${value.toFixed(1)}%`}
        />
      </div>
    </div>
  )
}

export default AdminAnalyticsDashboard