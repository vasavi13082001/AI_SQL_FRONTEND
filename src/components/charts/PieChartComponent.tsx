import React from 'react'
import {
  PieChart,
  Pie,
  Cell,
  Legend,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'

interface PieChartData {
  name: string
  value: number
  [key: string]: string | number
}

interface PieChartComponentProps {
  title?: string
  data: PieChartData[]
  dataKey?: string
  nameKey?: string
  colors: string[]
  height?: number
  showLegend?: boolean
  showTooltip?: boolean
  formatTooltip?: (value: number) => string
  innerRadius?: number
  outerRadius?: number
  className?: string
  donut?: boolean
}

type TooltipEntry = {
  name?: string
  value?: string | number
  color?: string
}

type SimpleTooltipProps = {
  active?: boolean
  payload?: TooltipEntry[]
  formatTooltip?: (value: number) => string
}

const CustomTooltip = ({ active, payload, formatTooltip }: SimpleTooltipProps) => {
  if (active && payload && payload.length) {
    const entry = payload[0]
    return (
      <div className="bg-white p-3 border border-gray-200 rounded shadow-lg">
        <p className="text-sm font-semibold text-gray-800">{entry.name}</p>
        <p style={{ color: entry.color }} className="text-sm font-medium">
          {formatTooltip ? formatTooltip(Number(entry.value || 0)) : entry.value}
        </p>
      </div>
    )
  }
  return null
}

export const PieChartComponent: React.FC<PieChartComponentProps> = ({
  title,
  data,
  dataKey = 'value',
  nameKey = 'name',
  colors,
  height = 300,
  showLegend = true,
  showTooltip = true,
  formatTooltip,
  innerRadius,
  outerRadius = 120,
  className = '',
  donut = false,
}) => {
  return (
    <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
      {title && <h3 className="text-lg font-semibold text-gray-800 mb-4">{title}</h3>}
      <ResponsiveContainer width="100%" height={height}>
        <PieChart>
          <Pie
            data={data}
            dataKey={dataKey}
            nameKey={nameKey}
            cx="50%"
            cy="50%"
            innerRadius={donut ? innerRadius || 60 : 0}
            outerRadius={outerRadius}
            paddingAngle={2}
            label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
          >
            {data.map((_, index) => (
              <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
            ))}
          </Pie>
          {showTooltip && <Tooltip content={<CustomTooltip formatTooltip={formatTooltip} />} />}
          {showLegend && <Legend />}
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}
