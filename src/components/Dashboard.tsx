import React, { useState } from 'react'
import { TrendingUp, Users, FileText, Activity } from 'lucide-react'
import MetadataExplorer from './MetadataExplorer'

const Dashboard: React.FC = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('month')

  const stats = [
    { label: 'Total Users', value: '12,543', icon: Users, trend: '+2.5%', color: 'blue' },
    { label: 'Revenue', value: '$45,231', icon: TrendingUp, trend: '+8.2%', color: 'green' },
    { label: 'Reports', value: '382', icon: FileText, trend: '+1.2%', color: 'purple' },
    { label: 'Active Now', value: '2,847', icon: Activity, trend: '+4.1%', color: 'orange' },
  ]

  const colorClasses = {
    blue: 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300',
    green: 'bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-300',
    purple: 'bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-300',
    orange: 'bg-orange-100 dark:bg-orange-900 text-orange-600 dark:text-orange-300',
  }

  return (
    <div className="p-4 lg:p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Welcome Back, Admin!</h1>
        <p className="text-gray-600 dark:text-gray-400">Here's what's happening in your dashboard today.</p>
      </div>

      <MetadataExplorer />

      {/* Period Selector */}
      <div className="mb-8 flex gap-2">
        {['day', 'week', 'month', 'year'].map((period) => (
          <button
            key={period}
            onClick={() => setSelectedPeriod(period)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              selectedPeriod === period
                ? 'bg-blue-600 text-white dark:bg-blue-500'
                : 'bg-gray-200 text-gray-900 dark:bg-dark-700 dark:text-gray-100 hover:bg-gray-300 dark:hover:bg-dark-600'
            }`}
          >
            {period.charAt(0).toUpperCase() + period.slice(1)}
          </button>
        ))}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => {
          const Icon = stat.icon
          const bgClass = colorClasses[stat.color as keyof typeof colorClasses]

          return (
            <div key={index} className="card">
              <div className="flex items-start justify-between mb-4">
                <div className={`p-3 rounded-lg ${bgClass}`}>
                  <Icon size={24} />
                </div>
                <span className="text-green-600 dark:text-green-400 font-semibold text-sm">{stat.trend}</span>
              </div>
              <p className="text-gray-600 dark:text-gray-400 text-sm mb-1">{stat.label}</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
            </div>
          )
        })}
      </div>

      {/* Charts and Tables Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Chart Placeholder */}
        <div className="lg:col-span-2 card">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Revenue Chart</h2>
          <div className="h-64 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-dark-700 dark:to-dark-600 rounded-lg flex items-center justify-center">
            <p className="text-gray-500 dark:text-gray-400">Chart will be rendered here</p>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="card">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Recent Activity</h2>
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((_, i) => (
              <div key={i} className="flex items-start gap-3 pb-4 border-b border-gray-200 dark:border-dark-700 last:pb-0 last:border-0">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">Activity {i + 1}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">2 hours ago</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Table Section */}
      <div className="card">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Recent Transactions</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-gray-200 dark:border-dark-700">
              <tr>
                <th className="text-left py-3 px-4 font-semibold text-gray-600 dark:text-gray-400">Transaction ID</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-600 dark:text-gray-400">User</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-600 dark:text-gray-400">Amount</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-600 dark:text-gray-400">Status</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-600 dark:text-gray-400">Date</th>
              </tr>
            </thead>
            <tbody>
              {[1, 2, 3, 4, 5].map((_, i) => (
                <tr key={i} className="border-b border-gray-100 dark:border-dark-700 hover:bg-gray-50 dark:hover:bg-dark-700/50 transition-colors">
                  <td className="py-3 px-4 text-gray-900 dark:text-gray-100">TXN{String(i + 1).padStart(5, '0')}</td>
                  <td className="py-3 px-4 text-gray-900 dark:text-gray-100">User {i + 1}</td>
                  <td className="py-3 px-4 text-gray-900 dark:text-gray-100 font-semibold">${(Math.random() * 1000).toFixed(2)}</td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        i % 2 === 0
                          ? 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300'
                          : 'bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300'
                      }`}
                    >
                      {i % 2 === 0 ? 'Completed' : 'Pending'}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-gray-600 dark:text-gray-400">2024-05-{String(i + 1).padStart(2, '0')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
