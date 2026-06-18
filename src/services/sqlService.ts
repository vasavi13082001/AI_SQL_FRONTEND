import { apiClient } from '../api/client'
import {
  getMockExecution,
  getMockGeneratedSql,
  getMockSqlValidation,
} from '../api/mockData'
import { shouldFallbackToMock } from '../api/utils'
import type {
  SQLExecuteRequest,
  SQLExecuteResponse,
  SQLGenerateRequest,
  SQLGenerateResponse,
  SQLValidationResponse,
} from '../types/api'

export const sqlService = {
  async generate(payload: SQLGenerateRequest): Promise<SQLGenerateResponse> {
    try {
      const { data } = await apiClient.post<SQLGenerateResponse>('/sql/generate', payload)
      return data
    } catch (error) {
      if (!shouldFallbackToMock(error)) {
        throw error
      }

      return getMockGeneratedSql(payload.prompt)
    }
  },

  async validate(sql: string): Promise<SQLValidationResponse> {
    try {
      const { data } = await apiClient.post<SQLValidationResponse>('/sql/validate', { sql })
      return data
    } catch (error) {
      if (!shouldFallbackToMock(error)) {
        throw error
      }

      return getMockSqlValidation(sql)
    }
  },

  async execute(payload: SQLExecuteRequest): Promise<SQLExecuteResponse> {
    try {
      const { data } = await apiClient.post<SQLExecuteResponse>('/sql/execute', payload)
      return data
    } catch (error) {
      if (!shouldFallbackToMock(error)) {
        throw error
      }

      return getMockExecution()
    }
  },
}
