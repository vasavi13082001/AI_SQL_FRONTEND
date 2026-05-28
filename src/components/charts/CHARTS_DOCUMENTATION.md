# Recharts Component Library

A comprehensive, reusable React chart component library built with Recharts for SQL dashboards and analytics.

## Components

### 1. **KPICard**
Key Performance Indicator card component with trend indicators.

**Features:**
- Customizable title, value, and unit
- Optional trend indicators (up/down with percentage)
- Icon support (predefined or custom)
- Color customization (background, icon, text)
- Dark mode support
- Hover effects

**Usage:**
```tsx
<KPICard
  title="Total Revenue"
  value="$145.2K"
  unit="USD"
  trend={{ value: 12, isPositive: true, label: 'vs last month' }}
  backgroundColor="bg-gradient-to-br from-blue-50 to-blue-100"
  iconColor="text-blue-600"
  textColor="text-blue-700"
/>
```

**Props:**
- `title: string` - Card title
- `value: string | number` - Main value to display
- `unit?: string` - Unit label
- `icon?: ReactNode` - Custom icon
- `trend?: { value: number; isPositive: boolean; label: string }` - Trend indicator
- `backgroundColor?: string` - Tailwind bg class
- `iconColor?: string` - Tailwind text color class
- `textColor?: string` - Tailwind text color class
- `showBorder?: boolean` - Show border (default: true)

---

### 2. **LineChartComponent**
Line chart for time-series data visualization.

**Features:**
- Multiple line support
- Customizable colors and stroke width
- Interactive tooltips with custom formatting
- Grid and legend options
- Responsive design
- Custom tooltip function

**Usage:**
```tsx
<LineChartComponent
  title="Revenue Trend"
  data={data}
  xAxisKey="month"
  lines={[
    { key: 'revenue', name: 'Revenue', color: '#3b82f6' },
    { key: 'expenses', name: 'Expenses', color: '#ef4444' },
  ]}
  formatTooltip={(value) => `$${value.toLocaleString()}`}
  height={300}
/>
```

**Props:**
- `title?: string` - Chart title
- `data: Array<{}>` - Chart data
- `lines: Array<{ key, name, color, strokeWidth? }>` - Line configurations
- `xAxisKey: string` - Key for X-axis data
- `height?: number` - Chart height (default: 300)
- `showGrid?: boolean` - Show grid (default: true)
- `showLegend?: boolean` - Show legend (default: true)
- `showTooltip?: boolean` - Show tooltip (default: true)
- `formatTooltip?: (value: number) => string` - Custom tooltip formatter
- `className?: string` - Additional CSS classes

---

### 3. **BarChartComponent**
Bar chart with vertical or horizontal orientation.

**Features:**
- Horizontal and vertical layouts
- Multiple bar support
- Customizable colors
- Responsive design
- Interactive tooltips
- Rounded bar corners

**Usage:**
```tsx
<BarChartComponent
  title="Sales by Region"
  data={data}
  xAxisKey="region"
  bars={[
    { key: 'sales', name: 'Sales', color: '#3b82f6' },
    { key: 'target', name: 'Target', color: '#10b981' },
  ]}
  layout="vertical"
/>
```

**Props:**
- `title?: string` - Chart title
- `data: Array<{}>` - Chart data
- `bars: Array<{ key, name, color }>` - Bar configurations
- `xAxisKey: string` - Key for X-axis data
- `height?: number` - Chart height (default: 300)
- `showGrid?: boolean` - Show grid (default: true)
- `showLegend?: boolean` - Show legend (default: true)
- `showTooltip?: boolean` - Show tooltip (default: true)
- `formatTooltip?: (value: number) => string` - Custom tooltip formatter
- `layout?: 'vertical' | 'horizontal'` - Chart orientation (default: 'vertical')
- `className?: string` - Additional CSS classes

---

### 4. **PieChartComponent**
Pie or donut chart for distribution visualization.

**Features:**
- Pie and donut chart modes
- Customizable colors
- Percentage labels
- Legend support
- Interactive tooltips
- Customizable radius

**Usage:**
```tsx
<PieChartComponent
  title="Product Distribution"
  data={[
    { name: 'Product A', value: 400 },
    { name: 'Product B', value: 300 },
  ]}
  colors={['#3b82f6', '#10b981']}
  donut={true}
  innerRadius={60}
  outerRadius={120}
/>
```

**Props:**
- `title?: string` - Chart title
- `data: Array<{ name, value }>` - Chart data
- `dataKey?: string` - Value key (default: 'value')
- `nameKey?: string` - Name key (default: 'name')
- `colors: string[]` - Color array
- `height?: number` - Chart height (default: 300)
- `showLegend?: boolean` - Show legend (default: true)
- `showTooltip?: boolean` - Show tooltip (default: true)
- `formatTooltip?: (value: number) => string` - Custom tooltip formatter
- `innerRadius?: number` - Inner radius for donut
- `outerRadius?: number` - Outer radius (default: 120)
- `donut?: boolean` - Donut mode (default: false)
- `className?: string` - Additional CSS classes

---

### 5. **AreaChartComponent**
Area chart for cumulative or stacked visualization.

**Features:**
- Multiple area support
- Stacking option
- Customizable opacity
- Responsive design
- Interactive tooltips
- Smooth curves

**Usage:**
```tsx
<AreaChartComponent
  title="Revenue Growth"
  data={data}
  xAxisKey="month"
  areas={[
    { key: 'sales', name: 'Sales', color: '#3b82f6', fillOpacity: 0.6 },
  ]}
  stacked={true}
/>
```

**Props:**
- `title?: string` - Chart title
- `data: Array<{}>` - Chart data
- `areas: Array<{ key, name, color, fillOpacity? }>` - Area configurations
- `xAxisKey: string` - Key for X-axis data
- `height?: number` - Chart height (default: 300)
- `showGrid?: boolean` - Show grid (default: true)
- `showLegend?: boolean` - Show legend (default: true)
- `showTooltip?: boolean` - Show tooltip (default: true)
- `formatTooltip?: (value: number) => string` - Custom tooltip formatter
- `stacked?: boolean` - Stack areas (default: false)
- `className?: string` - Additional CSS classes

---

### 6. **WarehouseAnalyticsDashboard**
Complete analytics dashboard for warehouse/database monitoring.

**Features:**
- KPI cards with metrics
- Storage growth trends
- Query performance analysis
- Table metrics comparison
- Cost breakdown visualization
- Cluster utilization monitoring
- Dark mode support
- Fully responsive

**Usage:**
```tsx
<WarehouseAnalyticsDashboard
  metrics={{
    totalStorage: 145.2,
    storageUnit: 'TB',
    usagePercentage: 68,
    queriesPerDay: 8932,
    avgQueryTime: 245,
    dataRefreshRate: '15min',
    costPerDay: 545.32,
  }}
  storageData={storageData}
  queryPerformanceData={queryData}
  tableMetricsData={tableData}
  costBreakdownData={costData}
  clusterUtilizationData={clusterData}
  darkMode={true}
/>
```

**Props:**
- `metrics: WarehouseMetrics` - Key metrics
- `storageData: WarehouseChartData[]` - Storage history
- `queryPerformanceData: WarehouseChartData[]` - Query metrics
- `tableMetricsData: Array<{ name, size, rows, scans }>` - Table stats
- `costBreakdownData: Array<{ name, value }>` - Cost distribution
- `clusterUtilizationData: Array<{ cluster, cpuUsage, memoryUsage, activeQueries }>` - Cluster stats
- `darkMode?: boolean` - Dark mode (default: false)

---

## Color Palettes

### Standard Colors
- Blue: `#3b82f6`
- Green: `#10b981`
- Red: `#ef4444`
- Amber: `#f59e0b`
- Purple: `#8b5cf6`
- Pink: `#ec4899`
- Cyan: `#06b6d4`
- Teal: `#14b8a6`

### Dark Mode
All components support dark mode through:
- Dark gradient backgrounds
- Lighter text colors
- Adjusted opacity for borders

---

## Data Format Examples

### Line/Area/Bar Chart Data
```typescript
const data = [
  { month: 'Jan', revenue: 4000, expenses: 2400 },
  { month: 'Feb', revenue: 3000, expenses: 1398 },
]
```

### Pie Chart Data
```typescript
const data = [
  { name: 'Product A', value: 400 },
  { name: 'Product B', value: 300 },
]
```

### Warehouse Storage Data
```typescript
const storageData = [
  { date: 'May 1', storage: 50.2 },
  { date: 'May 2', storage: 50.7 },
]
```

---

## Integration Examples

### In Dashboard Component
```tsx
import { KPICard, LineChartComponent, WarehouseAnalyticsDashboard } from './components/charts'

export const Dashboard = () => {
  return (
    <div>
      <KPICard title="Total Sales" value="$150K" />
      <LineChartComponent
        title="Sales Trend"
        data={data}
        xAxisKey="month"
        lines={[{ key: 'sales', name: 'Sales', color: '#3b82f6' }]}
      />
      <WarehouseAnalyticsDashboard {...dashboardProps} />
    </div>
  )
}
```

---

## Styling

All components use:
- **Tailwind CSS** for styling
- **Recharts** for charting
- **Lucide React** for icons
- Custom shadow and transition effects

### Customization Tips
1. Use `className` prop to add custom Tailwind classes
2. Customize colors via color props (hex or Tailwind classes)
3. Modify height via `height` prop (in pixels)
4. Format tooltips with `formatTooltip` function
5. Control visibility with `show*` boolean props

---

## Performance Notes

- Components are optimized with `useMemo` for data transformations
- Charts use React.memo for preventing unnecessary re-renders
- Responsive containers handle all screen sizes
- SVG-based rendering ensures smooth animations

---

## Browser Compatibility

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

---

## Dependencies

- `react`: ^18.2.0
- `react-dom`: ^18.2.0
- `recharts`: ^2.10.0+
- `lucide-react`: ^0.294.0
- `tailwindcss`: ^3.3.5
