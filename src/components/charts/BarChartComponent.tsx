import React from 'react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  TooltipProps,
} from 'recharts'

interface BarChartData {
  [key: string]: string | number
}

interface BarChartComponentProps {
  title?: string
  data: BarChartData[]
  bars: Array<{
    key: string
    name: string
    color: string
  }>
  xAxisKey: string
  height?: number
  showGrid?: boolean
  showLegend?: boolean
  showTooltip?: boolean
  formatTooltip?: (value: number) => string
  layout?: 'vertical' | 'horizontal'
  className?: string
}

const CustomTooltip = ({ active, payload, label, formatTooltip }: TooltipProps<number, string> & { formatTooltip?: (value: number) => string }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 border border-gray-200 rounded shadow-lg">
        <p className="text-sm font-semibold text-gray-800 mb-2">{label}</p>
        {payload.map((entry, index) => (
          <p key={index} style={{ color: entry.color }} className="text-sm">
            {entry.name}: {formatTooltip ? formatTooltip(entry.value as number) : entry.value}
          </p>
        ))}
      </div>
    )
  }
  return null
}

export const BarChartComponent: React.FC<BarChartComponentProps> = ({
  title,
  data,
  bars,
  xAxisKey,
  height = 300,
  showGrid = true,
  showLegend = true,
  showTooltip = true,
  formatTooltip,
  layout = 'vertical',
  className = '',
}) => {
  const isVertical = layout === 'vertical'

  return (
    <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
      {title && <h3 className="text-lg font-semibold text-gray-800 mb-4">{title}</h3>}
      <ResponsiveContainer width="100%" height={height}>
        <BarChart
          data={data}
          layout={isVertical ? 'vertical' : 'horizontal'}
          margin={isVertical ? { top: 5, right: 30, left: 200, bottom: 5 } : { top: 5, right: 30, left: 0, bottom: 5 }}
        >
          {showGrid && <CartesianGrid strokeDasharray="3 3" />}
          {isVertical ? (
            <>
              <XAxis type="number" />
              <YAxis dataKey={xAxisKey} type="category" width={190} />
            </>
          ) : (
            <>
              <XAxis dataKey={xAxisKey} />
              <YAxis />
            </>
          )}
          {showTooltip && <Tooltip content={<CustomTooltip formatTooltip={formatTooltip} />} />}
          {showLegend && <Legend />}
          {bars.map((bar, index) => (
            <Bar key={index} dataKey={bar.key} name={bar.name} fill={bar.color} radius={[0, 8, 8, 0]} />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
