/**
 * SQL Editor Integration Example Registry
 *
 * This file intentionally stores concise references to integration patterns.
 * Detailed code examples are documented in project markdown guides.
 */

export const INTEGRATION_EXAMPLES = {
  SIMPLE_QUERY_BUILDER: 'SimpleQueryBuilder',
  QUERY_BUILDER_WITH_EXECUTION: 'QueryBuilderWithExecution',
  QUERY_BUILDER_WITH_HISTORY: 'QueryBuilderWithHistory',
  DASHBOARD_INTEGRATION: 'DashboardWithQueryBuilder',
  MODAL_QUERY_EDITOR: 'ModalQueryEditor',
  QUERY_ANALYZER: 'QueryAnalyzer',
} as const

export type IntegrationExampleKey = keyof typeof INTEGRATION_EXAMPLES
