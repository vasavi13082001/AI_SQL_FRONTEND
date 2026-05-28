# Recharts Components - Integration Guide

## Quick Start

### 1. Import Components
```tsx
import {
  KPICard,
  LineChartComponent,
  BarChartComponent,
  PieChartComponent,
  AreaChartComponent,
  WarehouseAnalyticsDashboard,
} from '@/components/charts'
```

### 2. Basic KPI Cards
```tsx
export const SalesMetrics = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      <KPICard
        title="Total Sales"
        value="$245,680"
        trend={{ value: 12.5, isPositive: true, label: 'vs last month' }}
      />
      <KPICard
        title="Active Users"
        value="18,945"
        trend={{ value: 8.3, isPositive: true, label: 'growth' }}
      />
      <KPICard
        title="Conversion Rate"
        value="3.24%"
        trend={{ value: 0.5, isPositive: false, label: 'vs target' }}
      />
      <KPICard
        title="Avg Order Value"
        value="$89.50"
        trend={{ value: 5.2, isPositive: true, label: 'increase' }}
      />
    </div>
  )
}
```

### 3. Sales Dashboard
```tsx
export const SalesDashboard = () => {
  const monthlyData = [
    { month: 'Jan', sales: 4000, target: 3500 },
    { month: 'Feb', sales: 3000, target: 3500 },
    { month: 'Mar', sales: 2000, target: 3500 },
    { month: 'Apr', sales: 2780, target: 3500 },
    { month: 'May', sales: 1890, target: 3500 },
  ]

  return (
    <div className="space-y-6">
      <LineChartComponent
        title="Sales Trend"
        data={monthlyData}
        xAxisKey="month"
        lines={[
          { key: 'sales', name: 'Actual Sales', color: '#3b82f6' },
          { key: 'target', name: 'Target', color: '#10b981' },
        ]}
        formatTooltip={(value) => `$${value.toLocaleString()}`}
      />

      <BarChartComponent
        title="Monthly Performance"
        data={monthlyData}
        xAxisKey="month"
        bars={[
          { key: 'sales', name: 'Sales', color: '#3b82f6' },
          { key: 'target', name: 'Target', color: '#f59e0b' },
        ]}
      />
    </div>
  )
}
```

### 4. Product Analytics
```tsx
export const ProductAnalytics = () => {
  const productData = [
    { name: 'Laptop', value: 4500, sales: 125 },
    { name: 'Phone', value: 3200, sales: 298 },
    { name: 'Tablet', value: 2100, sales: 87 },
    { name: 'Accessories', value: 1800, sales: 542 },
  ]

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <PieChartComponent
        title="Sales by Product"
        data={productData}
        colors={['#3b82f6', '#10b981', '#f59e0b', '#ef4444']}
        formatTooltip={(value) => `$${value.toLocaleString()}`}
      />

      <BarChartComponent
        title="Product Performance"
        data={productData}
        xAxisKey="name"
        bars={[
          { key: 'sales', name: 'Units Sold', color: '#3b82f6' },
        ]}
        layout="vertical"
      />
    </div>
  )
}
```

### 5. Database Analytics
```tsx
export const DatabaseDashboard = () => {
  const metrics = {
    totalStorage: 245.5,
    storageUnit: 'GB',
    usagePercentage: 72,
    queriesPerDay: 12450,
    avgQueryTime: 342,
    dataRefreshRate: '5min',
    costPerDay: 280.50,
  }

  const storageData = [
    { date: 'May 1', storage: 230 },
    { date: 'May 2', storage: 235 },
    { date: 'May 3', storage: 240 },
    { date: 'May 4', storage: 245 },
  ]

  const queryData = [
    { date: 'May 1', avgTime: 320, p95Time: 580 },
    { date: 'May 2', avgTime: 335, p95Time: 620 },
    { date: 'May 3', avgTime: 310, p95Time: 560 },
    { date: 'May 4', avgTime: 342, p95Time: 590 },
  ]

  return (
    <WarehouseAnalyticsDashboard
      metrics={metrics}
      storageData={storageData}
      queryPerformanceData={queryData}
      tableMetricsData={[
        { name: 'users', size: 50 * 1024 * 1024, rows: 5000000, scans: 1240 },
        { name: 'orders', size: 120 * 1024 * 1024, rows: 2000000, scans: 5620 },
        { name: 'events', size: 800 * 1024 * 1024, rows: 50000000, scans: 28900 },
      ]}
      costBreakdownData={[
        { name: 'Compute', value: 150 },
        { name: 'Storage', value: 100 },
        { name: 'Data Transfer', value: 30 },
      ]}
      clusterUtilizationData={[
        { cluster: 'prod-us', cpuUsage: 65, memoryUsage: 72, activeQueries: 23 },
        { cluster: 'prod-eu', cpuUsage: 48, memoryUsage: 55, activeQueries: 15 },
      ]}
    />
  )
}
```

## Advanced Usage

### Custom Formatting
```tsx
// Format large numbers
const formatLargeNumber = (value: number) => {
  if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`
  if (value >= 1000) return `${(value / 1000).toFixed(1)}K`
  return value.toString()
}

<LineChartComponent
  data={data}
  xAxisKey="month"
  lines={[{ key: 'visits', name: 'Visits', color: '#3b82f6' }]}
  formatTooltip={formatLargeNumber}
/>
```

### Dark Mode Integration
```tsx
export const Dashboard = ({ darkMode }: { darkMode: boolean }) => {
  const bgClass = darkMode ? 'bg-gray-900' : 'bg-white'
  const textClass = darkMode ? 'text-white' : 'text-gray-900'

  return (
    <div className={`${bgClass} ${textClass}`}>
      <WarehouseAnalyticsDashboard
        {...props}
        darkMode={darkMode}
      />
    </div>
  )
}
```

### Dynamic Data Fetching
```tsx
export const RealtimeDashboard = () => {
  const [data, setData] = useState([])
  const [metrics, setMetrics] = useState(null)

  useEffect(() => {
    // Fetch initial data
    fetchDashboardData().then(result => {
      setData(result.chartData)
      setMetrics(result.metrics)
    })

    // Refresh every 30 seconds
    const interval = setInterval(() => {
      fetchDashboardData().then(result => {
        setData(result.chartData)
        setMetrics(result.metrics)
      })
    }, 30000)

    return () => clearInterval(interval)
  }, [])

  return metrics ? <WarehouseAnalyticsDashboard metrics={metrics} {...data} /> : null
}
```

### Combined Charts
```tsx
export const ComprehensiveAnalytics = () => {
  return (
    <div className="space-y-6">
      {/* Row 1: KPIs */}
      <div className="grid grid-cols-4 gap-6">
        <KPICard title="Metric 1" value="Value 1" />
        <KPICard title="Metric 2" value="Value 2" />
        <KPICard title="Metric 3" value="Value 3" />
        <KPICard title="Metric 4" value="Value 4" />
      </div>

      {/* Row 2: Trends */}
      <div className="grid grid-cols-2 gap-6">
        <LineChartComponent {...lineProps} />
        <AreaChartComponent {...areaProps} />
      </div>

      {/* Row 3: Distribution */}
      <div className="grid grid-cols-2 gap-6">
        <PieChartComponent {...pieProps} />
        <BarChartComponent {...barProps} />
      </div>
    </div>
  )
}
```

## Data Transformation Helpers

```tsx
// Convert server data to chart format
export const transformToChartData = (serverData: any[]) => {
  return serverData.map(item => ({
    month: new Date(item.date).toLocaleDateString('en-US', { month: 'short' }),
    sales: item.total,
    target: item.goal,
  }))
}

// Group data by category
export const groupByCategory = (data: any[], category: string) => {
  return data.reduce((acc, item) => {
    const key = item[category]
    if (!acc[key]) acc[key] = []
    acc[key].push(item)
    return acc
  }, {})
}

// Aggregate metrics
export const calculateMetrics = (data: any[]) => {
  return {
    total: data.reduce((sum, item) => sum + item.value, 0),
    average: data.reduce((sum, item) => sum + item.value, 0) / data.length,
    max: Math.max(...data.map(item => item.value)),
    min: Math.min(...data.map(item => item.value)),
  }
}
```

## Responsive Behavior

All components are fully responsive:
- **Mobile**: Single column layout, smaller chart heights
- **Tablet**: 2 column grid, medium chart heights
- **Desktop**: 3-4 column grid, full chart heights

Use Tailwind's responsive classes:
```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
  <KPICard {...props} />
</div>
```

## Performance Tips

1. **Memoize Data Transformations**
```tsx
const chartData = useMemo(() => transformData(rawData), [rawData])
```

2. **Limit Data Points**
```tsx
const chartData = useMemo(() => {
  // Only show last 30 data points
  return data.slice(-30)
}, [data])
```

3. **Debounce Updates**
```tsx
const [data, setData] = useState([])
const debouncedSetData = useMemo(
  () => debounce((newData) => setData(newData), 500),
  []
)
```

## Common Patterns

### Filtering/Sorting
```tsx
const [sortBy, setSortBy] = useState('date')
const sortedData = useMemo(() => {
  return [...data].sort((a, b) => a[sortBy] - b[sortBy])
}, [data, sortBy])
```

### Date Range Selection
```tsx
const [dateRange, setDateRange] = useState({ start: '', end: '' })
const filteredData = useMemo(() => {
  return data.filter(item =>
    item.date >= dateRange.start && item.date <= dateRange.end
  )
}, [data, dateRange])
```

### Export to CSV
```tsx
export const exportToCSV = (data: any[], filename: string) => {
  const csv = [
    Object.keys(data[0]).join(','),
    ...data.map(row => Object.values(row).join(','))
  ].join('\n')

  const blob = new Blob([csv], { type: 'text/csv' })
  const url = window.URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
}
```
