import React, { useMemo } from 'react'
import { KPICard } from './KPICard'
import { BarChartComponent } from './BarChartComponent'
import { LineChartComponent } from './LineChartComponent'
import { PieChartComponent } from './PieChartComponent'
import { AreaChartComponent } from './AreaChartComponent'
import { Database, TrendingUp, Zap, AlertCircle } from 'lucide-react'

export interface WarehouseMetrics {
  totalStorage: number
  storageUnit: string
  usagePercentage: number
  queriesPerDay: number
  avgQueryTime: number
  dataRefreshRate: string
  costPerDay: number
}

export interface WarehouseChartData {
  date: string
  [key: string]: string | number
}

interface WarehouseAnalyticsDashboardProps {
  metrics: WarehouseMetrics
  storageData: WarehouseChartData[]
  queryPerformanceData: WarehouseChartData[]
  tableMetricsData: Array<{
    name: string
    size: number
    rows: number
    scans: number
  }>
  costBreakdownData: Array<{
    name: string
    value: number
  }>
  clusterUtilizationData: Array<{
    cluster: string
    cpuUsage: number
    memoryUsage: number
    activeQueries: number
  }>
  darkMode?: boolean
}

const formatBytes = (bytes: number) => {
  if (bytes >= 1024 * 1024 * 1024) {
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`
  }
  if (bytes >= 1024 * 1024) {
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
  }
  return `${(bytes / 1024).toFixed(2)} KB`
}

const formatCurrency = (value: number) => {
  return `$${value.toFixed(2)}`
}

const formatTime = (ms: number) => {
  if (ms >= 1000) {
    return `${(ms / 1000).toFixed(2)}s`
  }
  return `${ms.toFixed(0)}ms`
}

export const WarehouseAnalyticsDashboard: React.FC<WarehouseAnalyticsDashboardProps> = ({
  metrics,
  storageData,
  queryPerformanceData,
  tableMetricsData,
  costBreakdownData,
  clusterUtilizationData,
  darkMode = false,
}) => {
  const bgClass = darkMode ? 'bg-gray-900' : 'bg-gray-50'
  const textClass = darkMode ? 'text-gray-100' : 'text-gray-900'

  const STORAGE_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444']
  const COST_COLORS = ['#6366f1', '#8b5cf6', '#d946ef', '#ec4899']
  const CLUSTER_COLORS = ['#06b6d4', '#14b8a6', '#84cc16', '#eab308']

  const tableMetricsChartData = useMemo(
    () =>
      tableMetricsData.map((table) => ({
        name: table.name.substring(0, 15),
        'Size (GB)': parseFloat((table.size / (1024 * 1024 * 1024)).toFixed(2)),
        'Rows (M)': parseFloat((table.rows / 1000000).toFixed(2)),
        Scans: table.scans,
      })),
    [tableMetricsData],
  )

  const clusterChartData = useMemo(
    () =>
      clusterUtilizationData.map((cluster) => ({
        cluster: cluster.cluster,
        CPU: cluster.cpuUsage,
        Memory: cluster.memoryUsage,
        'Active Queries': cluster.activeQueries,
      })),
    [clusterUtilizationData],
  )

  return (
    <div className={`${bgClass} ${textClass} transition-colors`}>
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <KPICard
          title="Total Storage"
          value={metrics.totalStorage}
          unit={metrics.storageUnit}
          icon={<Database className="w-6 h-6" />}
          backgroundColor={darkMode ? 'bg-gradient-to-br from-blue-900 to-blue-800' : 'bg-gradient-to-br from-blue-50 to-blue-100'}
          iconColor={darkMode ? 'text-blue-400' : 'text-blue-600'}
          textColor={darkMode ? 'text-blue-300' : 'text-blue-700'}
          trend={{
            value: metrics.usagePercentage,
            isPositive: metrics.usagePercentage < 80,
            label: 'Usage',
          }}
        />
        <KPICard
          title="Queries/Day"
          value={metrics.queriesPerDay}
          icon={<TrendingUp className="w-6 h-6" />}
          backgroundColor={darkMode ? 'bg-gradient-to-br from-green-900 to-green-800' : 'bg-gradient-to-br from-green-50 to-green-100'}
          iconColor={darkMode ? 'text-green-400' : 'text-green-600'}
          textColor={darkMode ? 'text-green-300' : 'text-green-700'}
          trend={{
            value: 12,
            isPositive: true,
            label: 'vs yesterday',
          }}
        />
        <KPICard
          title="Avg Query Time"
          value={formatTime(metrics.avgQueryTime)}
          icon={<Zap className="w-6 h-6" />}
          backgroundColor={darkMode ? 'bg-gradient-to-br from-purple-900 to-purple-800' : 'bg-gradient-to-br from-purple-50 to-purple-100'}
          iconColor={darkMode ? 'text-purple-400' : 'text-purple-600'}
          textColor={darkMode ? 'text-purple-300' : 'text-purple-700'}
          trend={{
            value: -8,
            isPositive: true,
            label: 'improvement',
          }}
        />
        <KPICard
          title="Daily Cost"
          value={formatCurrency(metrics.costPerDay)}
          icon={<AlertCircle className="w-6 h-6" />}
          backgroundColor={darkMode ? 'bg-gradient-to-br from-amber-900 to-amber-800' : 'bg-gradient-to-br from-amber-50 to-amber-100'}
          iconColor={darkMode ? 'text-amber-400' : 'text-amber-600'}
          textColor={darkMode ? 'text-amber-300' : 'text-amber-700'}
          trend={{
            value: 5,
            isPositive: false,
            label: 'vs average',
          }}
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Storage Growth Over Time */}
        <LineChartComponent
          title="Storage Growth"
          data={storageData}
          xAxisKey="date"
          lines={[
            { key: 'storage', name: 'Storage (GB)', color: '#3b82f6', strokeWidth: 2 },
          ]}
          formatTooltip={(value) => `${value.toFixed(2)} GB`}
          className={darkMode ? 'bg-gray-800' : ''}
        />

        {/* Query Performance Trends */}
        <AreaChartComponent
          title="Query Performance"
          data={queryPerformanceData}
          xAxisKey="date"
          areas={[
            { key: 'avgTime', name: 'Avg Time (ms)', color: '#10b981', fillOpacity: 0.6 },
            { key: 'p95Time', name: 'P95 Time (ms)', color: '#ef4444', fillOpacity: 0.4 },
          ]}
          formatTooltip={(value) => `${value.toFixed(0)}ms`}
          stacked={false}
          className={darkMode ? 'bg-gray-800' : ''}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Table Metrics */}
        <BarChartComponent
          title="Table Metrics"
          data={tableMetricsChartData}
          xAxisKey="name"
          bars={[
            { key: 'Size (GB)', name: 'Size (GB)', color: '#3b82f6' },
            { key: 'Rows (M)', name: 'Rows (Millions)', color: '#10b981' },
          ]}
          layout="vertical"
          className={darkMode ? 'bg-gray-800' : ''}
        />

        {/* Cost Breakdown */}
        <PieChartComponent
          title="Cost Breakdown"
          data={costBreakdownData}
          colors={COST_COLORS}
          formatTooltip={(value) => formatCurrency(value)}
          className={darkMode ? 'bg-gray-800' : ''}
        />
      </div>

      <div className="grid grid-cols-1 gap-6">
        {/* Cluster Utilization */}
        <BarChartComponent
          title="Cluster Utilization"
          data={clusterChartData}
          xAxisKey="cluster"
          bars={[
            { key: 'CPU', name: 'CPU Usage (%)', color: '#ef4444' },
            { key: 'Memory', name: 'Memory Usage (%)', color: '#f59e0b' },
          ]}
          layout="vertical"
          formatTooltip={(value) => `${value.toFixed(1)}%`}
          className={darkMode ? 'bg-gray-800' : ''}
        />
      </div>
    </div>
  )
}
