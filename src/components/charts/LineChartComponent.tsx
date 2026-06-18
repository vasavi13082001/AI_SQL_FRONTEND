import React from 'react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'

interface LineChartData {
  [key: string]: string | number
}

interface LineChartComponentProps {
  title?: string
  data: LineChartData[]
  lines: Array<{
    key: string
    name: string
    color: string
    strokeWidth?: number
  }>
  xAxisKey: string
  height?: number
  showGrid?: boolean
  showLegend?: boolean
  showTooltip?: boolean
  formatTooltip?: (value: number) => string
  className?: string
}

type TooltipEntry = {
  name?: string
  value?: string | number
  color?: string
}

type SimpleTooltipProps = {
  active?: boolean
  payload?: TooltipEntry[]
  label?: string | number
  formatTooltip?: (value: number) => string
}

const CustomTooltip = ({ active, payload, label, formatTooltip }: SimpleTooltipProps) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 border border-gray-200 rounded shadow-lg">
        <p className="text-sm font-semibold text-gray-800 mb-2">{label}</p>
        {payload.map((entry: TooltipEntry, index: number) => (
          <p key={index} style={{ color: entry.color }} className="text-sm">
            {entry.name}: {formatTooltip ? formatTooltip(Number(entry.value || 0)) : entry.value}
          </p>
        ))}
      </div>
    )
  }
  return null
}

export const LineChartComponent: React.FC<LineChartComponentProps> = ({
  title,
  data,
  lines,
  xAxisKey,
  height = 300,
  showGrid = true,
  showLegend = true,
  showTooltip = true,
  formatTooltip,
  className = '',
}) => {
  return (
    <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
      {title && <h3 className="text-lg font-semibold text-gray-800 mb-4">{title}</h3>}
      <ResponsiveContainer width="100%" height={height}>
        <LineChart data={data} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
          {showGrid && <CartesianGrid strokeDasharray="3 3" />}
          <XAxis dataKey={xAxisKey} />
          <YAxis />
          {showTooltip && <Tooltip content={<CustomTooltip formatTooltip={formatTooltip} />} />}
          {showLegend && <Legend />}
          {lines.map((line, index) => (
            <Line
              key={index}
              type="monotone"
              dataKey={line.key}
              stroke={line.color}
              name={line.name}
              strokeWidth={line.strokeWidth || 2}
              dot={false}
              activeDot={{ r: 6 }}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
