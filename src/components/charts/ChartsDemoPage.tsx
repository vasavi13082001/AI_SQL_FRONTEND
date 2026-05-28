import React, { useState } from 'react'
import {
  KPICard,
  LineChartComponent,
  BarChartComponent,
  PieChartComponent,
  AreaChartComponent,
  WarehouseAnalyticsDashboard,
  WarehouseMetrics,
  WarehouseChartData,
} from './index'
import { BarChart3, TrendingUp } from 'lucide-react'

// Sample data generators
const generateStorageData = (): WarehouseChartData[] => {
  const data = []
  const baseDate = new Date(2026, 4, 1)
  for (let i = 0; i < 30; i++) {
    const date = new Date(baseDate)
    date.setDate(date.getDate() + i)
    data.push({
      date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      storage: 50 + i * 0.5 + Math.random() * 2,
    })
  }
  return data
}

const generateQueryPerformanceData = (): WarehouseChartData[] => {
  const data = []
  const baseDate = new Date(2026, 4, 1)
  for (let i = 0; i < 30; i++) {
    const date = new Date(baseDate)
    date.setDate(date.getDate() + i)
    data.push({
      date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      avgTime: 150 + Math.random() * 100,
      p95Time: 300 + Math.random() * 150,
    })
  }
  return data
}

const mockTableMetrics = [
  { name: 'users_events', size: 15 * 1024 * 1024 * 1024, rows: 1500000000, scans: 245 },
  { name: 'orders', size: 8.5 * 1024 * 1024 * 1024, rows: 850000000, scans: 892 },
  { name: 'products', size: 2.1 * 1024 * 1024 * 1024, rows: 210000000, scans: 1203 },
  { name: 'customer_profiles', size: 5.3 * 1024 * 1024 * 1024, rows: 530000000, scans: 567 },
]

const mockCostBreakdown = [
  { name: 'Storage', value: 120 },
  { name: 'Compute', value: 280 },
  { name: 'Data Transfer', value: 95 },
  { name: 'Premium Features', value: 50 },
]

const mockClusterUtilization = [
  { cluster: 'cluster-us-east', cpuUsage: 65, memoryUsage: 72, activeQueries: 23 },
  { cluster: 'cluster-us-west', cpuUsage: 48, memoryUsage: 55, activeQueries: 15 },
  { cluster: 'cluster-eu-central', cpuUsage: 82, memoryUsage: 88, activeQueries: 34 },
  { cluster: 'cluster-ap-south', cpuUsage: 35, memoryUsage: 42, activeQueries: 8 },
]

const mockMetrics: WarehouseMetrics = {
  totalStorage: 145.2,
  storageUnit: 'TB',
  usagePercentage: 68,
  queriesPerDay: 8932,
  avgQueryTime: 245,
  dataRefreshRate: '15min',
  costPerDay: 545.32,
}

const mockLineChartData = [
  { month: 'Jan', revenue: 4000, expenses: 2400 },
  { month: 'Feb', revenue: 3000, expenses: 1398 },
  { month: 'Mar', revenue: 2000, expenses: 9800 },
  { month: 'Apr', revenue: 2780, expenses: 3908 },
  { month: 'May', revenue: 1890, expenses: 4800 },
  { month: 'Jun', revenue: 2390, expenses: 3800 },
]

const mockPieData = [
  { name: 'Product A', value: 400 },
  { name: 'Product B', value: 300 },
  { name: 'Product C', value: 200 },
  { name: 'Product D', value: 100 },
]

export const ChartsDemoPage: React.FC = () => {
  const [darkMode, setDarkMode] = useState(false)

  const bgClass = darkMode ? 'bg-gray-900' : 'bg-white'
  const textClass = darkMode ? 'text-white' : 'text-gray-900'

  return (
    <div className={`${bgClass} ${textClass} min-h-screen transition-colors`}>
      {/* Header */}
      <div className={`${darkMode ? 'bg-gray-800' : 'bg-gray-50'} border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'} sticky top-0 z-10`}>
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <BarChart3 className="w-8 h-8 text-blue-500" />
              <h1 className="text-3xl font-bold">Charts Demo</h1>
            </div>
            <button
              onClick={() => setDarkMode(!darkMode)}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                darkMode
                  ? 'bg-gray-700 hover:bg-gray-600 text-gray-100'
                  : 'bg-gray-200 hover:bg-gray-300 text-gray-900'
              }`}
            >
              {darkMode ? '🌙 Dark' : '☀️ Light'}
            </button>
          </div>
          <p className="mt-2 text-sm opacity-75">Comprehensive Recharts component library with KPI cards, trends, and analytics</p>
        </div>
      </div>

      <div className={`max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8 ${darkMode ? 'bg-gray-900' : 'bg-white'}`}>
        {/* Quick Stats Section */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <TrendingUp className="w-6 h-6" />
            KPI Cards
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <KPICard
              title="Total Revenue"
              value="$145.2K"
              trend={{ value: 12, isPositive: true, label: 'vs last month' }}
              backgroundColor={darkMode ? 'bg-gradient-to-br from-blue-900 to-blue-800' : 'bg-gradient-to-br from-blue-50 to-blue-100'}
              iconColor={darkMode ? 'text-blue-400' : 'text-blue-600'}
              textColor={darkMode ? 'text-blue-300' : 'text-blue-700'}
            />
            <KPICard
              title="Active Users"
              value="24,580"
              trend={{ value: 8, isPositive: true, label: 'growth' }}
              backgroundColor={darkMode ? 'bg-gradient-to-br from-green-900 to-green-800' : 'bg-gradient-to-br from-green-50 to-green-100'}
              iconColor={darkMode ? 'text-green-400' : 'text-green-600'}
              textColor={darkMode ? 'text-green-300' : 'text-green-700'}
            />
            <KPICard
              title="Conversion Rate"
              value="3.24%"
              trend={{ value: 2, isPositive: false, label: 'vs target' }}
              backgroundColor={darkMode ? 'bg-gradient-to-br from-purple-900 to-purple-800' : 'bg-gradient-to-br from-purple-50 to-purple-100'}
              iconColor={darkMode ? 'text-purple-400' : 'text-purple-600'}
              textColor={darkMode ? 'text-purple-300' : 'text-purple-700'}
            />
            <KPICard
              title="Avg Order Value"
              value="$89.50"
              trend={{ value: 5, isPositive: true, label: 'increase' }}
              backgroundColor={darkMode ? 'bg-gradient-to-br from-amber-900 to-amber-800' : 'bg-gradient-to-br from-amber-50 to-amber-100'}
              iconColor={darkMode ? 'text-amber-400' : 'text-amber-600'}
              textColor={darkMode ? 'text-amber-300' : 'text-amber-700'}
            />
          </div>
        </div>

        {/* Basic Charts Section */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Basic Charts</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <LineChartComponent
              title="Revenue vs Expenses Trend"
              data={mockLineChartData}
              xAxisKey="month"
              lines={[
                { key: 'revenue', name: 'Revenue', color: '#3b82f6', strokeWidth: 2 },
                { key: 'expenses', name: 'Expenses', color: '#ef4444', strokeWidth: 2 },
              ]}
              formatTooltip={(value) => `$${value.toLocaleString()}`}
            />
            <AreaChartComponent
              title="Revenue Growth Area"
              data={mockLineChartData}
              xAxisKey="month"
              areas={[
                { key: 'revenue', name: 'Revenue', color: '#10b981', fillOpacity: 0.6 },
              ]}
              formatTooltip={(value) => `$${value.toLocaleString()}`}
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <BarChartComponent
              title="Monthly Revenue Comparison"
              data={mockLineChartData}
              xAxisKey="month"
              bars={[
                { key: 'revenue', name: 'Revenue', color: '#3b82f6' },
                { key: 'expenses', name: 'Expenses', color: '#f59e0b' },
              ]}
              formatTooltip={(value) => `$${value.toLocaleString()}`}
            />
            <PieChartComponent
              title="Product Sales Distribution"
              data={mockPieData}
              colors={['#3b82f6', '#10b981', '#f59e0b', '#ef4444']}
              formatTooltip={(value) => `${value} units`}
            />
          </div>
        </div>

        {/* Warehouse Analytics Section */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Warehouse Analytics Dashboard</h2>
          <WarehouseAnalyticsDashboard
            metrics={mockMetrics}
            storageData={generateStorageData()}
            queryPerformanceData={generateQueryPerformanceData()}
            tableMetricsData={mockTableMetrics}
            costBreakdownData={mockCostBreakdown}
            clusterUtilizationData={mockClusterUtilization}
            darkMode={darkMode}
          />
        </div>

        {/* Donut Chart Example */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Donut Chart</h2>
          <div className="max-w-md">
            <PieChartComponent
              title="Budget Allocation"
              data={mockCostBreakdown}
              colors={['#6366f1', '#8b5cf6', '#d946ef', '#ec4899']}
              donut={true}
              formatTooltip={(value) => `$${value.toLocaleString()}`}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
