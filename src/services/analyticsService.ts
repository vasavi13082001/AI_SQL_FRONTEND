import { apiClient } from '../api/client'
import {
  getMockActivityMonitoring,
  getMockDashboardAnalytics,
  getMockQueryHistory,
} from '../api/mockData'
import { shouldFallbackToMock } from '../api/utils'
import type {
  ActivityMonitoringResponse,
  DashboardAnalyticsResponse,
  QueryHistoryRecord,
} from '../types/api'

export const analyticsService = {
  async getDashboardAnalytics(): Promise<DashboardAnalyticsResponse> {
    try {
      const { data } = await apiClient.get<DashboardAnalyticsResponse>('/analytics/dashboard')
      return data
    } catch (error) {
      if (!shouldFallbackToMock(error)) {
        throw error
      }

      return getMockDashboardAnalytics()
    }
  },

  async getQueryHistory(): Promise<QueryHistoryRecord[]> {
    try {
      const { data } = await apiClient.get<QueryHistoryRecord[]>('/analytics/query-history')
      return data
    } catch (error) {
      if (!shouldFallbackToMock(error)) {
        throw error
      }

      return getMockQueryHistory()
    }
  },

  async getActivityMonitoring(): Promise<ActivityMonitoringResponse> {
    try {
      const { data } = await apiClient.get<ActivityMonitoringResponse>('/analytics/activity-monitor')
      return data
    } catch (error) {
      if (!shouldFallbackToMock(error)) {
        throw error
      }

      return getMockActivityMonitoring()
    }
  },
}
