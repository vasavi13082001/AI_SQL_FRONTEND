import React from 'react'
import { TrendingUp, TrendingDown, DollarSign, Users, Activity, Database } from 'lucide-react'

interface KPICardProps {
  title: string
  value: string | number
  unit?: string
  icon?: React.ReactNode
  trend?: {
    value: number
    isPositive: boolean
    label: string
  }
  backgroundColor?: string
  iconColor?: string
  textColor?: string
  showBorder?: boolean
}

const defaultIcons: Record<string, React.ReactNode> = {
  revenue: <DollarSign className="w-6 h-6" />,
  users: <Users className="w-6 h-6" />,
  activity: <Activity className="w-6 h-6" />,
  database: <Database className="w-6 h-6" />,
}

export const KPICard: React.FC<KPICardProps> = ({
  title,
  value,
  unit = '',
  icon,
  trend,
  backgroundColor = 'bg-gradient-to-br from-blue-50 to-blue-100',
  iconColor = 'text-blue-600',
  textColor = 'text-blue-700',
  showBorder = true,
}) => {
  return (
    <div
      className={`rounded-lg p-6 shadow-md hover:shadow-lg transition-shadow ${backgroundColor} ${
        showBorder ? 'border border-blue-200' : ''
      }`}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 mb-2">{title}</p>
          <div className="flex items-baseline gap-2">
            <span className={`text-3xl font-bold ${textColor}`}>{value}</span>
            {unit && <span className="text-sm text-gray-500">{unit}</span>}
          </div>
        </div>
        <div className={`p-3 rounded-lg bg-white/50 ${iconColor}`}>
          {icon || defaultIcons.activity}
        </div>
      </div>

      {trend && (
        <div className="flex items-center gap-2 text-sm">
          <div className={`flex items-center gap-1 ${trend.isPositive ? 'text-green-600' : 'text-red-600'}`}>
            {trend.isPositive ? (
              <TrendingUp className="w-4 h-4" />
            ) : (
              <TrendingDown className="w-4 h-4" />
            )}
            <span className="font-semibold">{trend.value}%</span>
          </div>
          <span className="text-gray-500">{trend.label}</span>
        </div>
      )}
    </div>
  )
}
