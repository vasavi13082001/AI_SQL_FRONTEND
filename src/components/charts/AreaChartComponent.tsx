import React from 'react'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  TooltipProps,
} from 'recharts'

interface AreaChartData {
  [key: string]: string | number
}

interface AreaChartComponentProps {
  title?: string
  data: AreaChartData[]
  areas: Array<{
    key: string
    name: string
    color: string
    fillOpacity?: number
  }>
  xAxisKey: string
  height?: number
  showGrid?: boolean
  showLegend?: boolean
  showTooltip?: boolean
  formatTooltip?: (value: number) => string
  stacked?: boolean
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

export const AreaChartComponent: React.FC<AreaChartComponentProps> = ({
  title,
  data,
  areas,
  xAxisKey,
  height = 300,
  showGrid = true,
  showLegend = true,
  showTooltip = true,
  formatTooltip,
  stacked = false,
  className = '',
}) => {
  return (
    <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
      {title && <h3 className="text-lg font-semibold text-gray-800 mb-4">{title}</h3>}
      <ResponsiveContainer width="100%" height={height}>
        <AreaChart data={data} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
          {showGrid && <CartesianGrid strokeDasharray="3 3" />}
          <XAxis dataKey={xAxisKey} />
          <YAxis />
          {showTooltip && <Tooltip content={<CustomTooltip formatTooltip={formatTooltip} />} />}
          {showLegend && <Legend />}
          {areas.map((area, index) => (
            <Area
              key={index}
              type="monotone"
              dataKey={area.key}
              name={area.name}
              fill={area.color}
              stroke={area.color}
              fillOpacity={area.fillOpacity || 0.6}
              stackId={stacked ? 'stack' : undefined}
            />
          ))}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
