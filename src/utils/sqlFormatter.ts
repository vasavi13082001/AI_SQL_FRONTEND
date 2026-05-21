/**
 * SQL Formatter utility for formatting SQL queries
 */

export interface FormatterOptions {
  indent?: number
  uppercase?: boolean
}

type ValidationLevel = 'error' | 'warning' | 'tip'
type ValidationStatus = 'empty' | 'valid' | 'warning' | 'invalid'

export interface SQLValidationMessage {
  level: ValidationLevel
  code: string
  message: string
  detail?: string
}

export interface SQLValidationBadge {
  label: string
  tone: 'neutral' | 'success' | 'warning' | 'error' | 'info'
}

export interface SQLValidationResult {
  status: ValidationStatus
  errors: SQLValidationMessage[]
  warnings: SQLValidationMessage[]
  tips: SQLValidationMessage[]
  badges: SQLValidationBadge[]
}

const SQL_KEYWORDS = [
  'SELECT', 'FROM', 'WHERE', 'AND', 'OR', 'NOT', 'IN', 'LIKE', 'BETWEEN', 'IS', 'NULL',
  'JOIN', 'INNER', 'LEFT', 'RIGHT', 'FULL', 'OUTER', 'ON', 'USING',
  'GROUP', 'BY', 'HAVING', 'ORDER', 'ASC', 'DESC', 'LIMIT', 'OFFSET',
  'DISTINCT', 'ALL', 'CASE', 'WHEN', 'THEN', 'ELSE', 'END',
  'INSERT', 'INTO', 'VALUES', 'UPDATE', 'SET', 'DELETE',
  'CREATE', 'TABLE', 'ALTER', 'DROP', 'ADD', 'COLUMN', 'CONSTRAINT', 'PRIMARY', 'KEY',
  'FOREIGN', 'UNIQUE', 'DEFAULT', 'CHECK', 'INDEX', 'VIEW', 'DATABASE', 'SCHEMA',
  'UNION', 'EXCEPT', 'INTERSECT', 'WITH', 'AS', 'CROSS',
  'CAST', 'COALESCE', 'NULLIF', 'EXISTS', 'SUBQUERY',
  'GRANT', 'REVOKE', 'COMMIT', 'ROLLBACK', 'BEGIN', 'TRANSACTION',
  'COUNT', 'SUM', 'AVG', 'MIN', 'MAX', 'ROW_NUMBER', 'PARTITION', 'OVER',
]

const SQL_FUNCTIONS = [
  'ABS', 'ROUND', 'FLOOR', 'CEIL', 'LENGTH', 'SUBSTR', 'UPPER', 'LOWER', 'TRIM',
  'CONCAT', 'REPLACE', 'DATE', 'NOW', 'YEAR', 'MONTH', 'DAY', 'HOUR', 'MINUTE', 'SECOND',
]

/**
 * Format SQL query with proper indentation and line breaks
 */
export function formatSQL(sql: string, options: FormatterOptions = {}): string {
  const { indent = 2, uppercase = true } = options

  let formatted = sql.trim()

  // Normalize whitespace
  formatted = formatted
    .replace(/\s+/g, ' ') // Replace multiple spaces with single space
    .replace(/\s*,\s*/g, ', ') // Normalize commas
    .replace(/\s*\(\s*/g, ' (') // Normalize parentheses
    .replace(/\s*\)\s*/g, ') ')

  // Add line breaks before major keywords
  const majorKeywords = ['SELECT', 'FROM', 'WHERE', 'AND', 'OR', 'GROUP BY', 'HAVING', 'ORDER BY', 'LIMIT', 'JOIN', 'LEFT JOIN', 'INNER JOIN', 'RIGHT JOIN', 'FULL JOIN', 'UNION']

  majorKeywords.forEach((keyword) => {
    const regex = new RegExp(`\\s+${keyword}\\s+`, 'gi')
    formatted = formatted.replace(regex, `\n${keyword} `)
  })

  // Add line breaks after commas in SELECT and column lists
  const lines = formatted.split('\n').map((line) => {
    if (line.trim().toUpperCase().startsWith('SELECT')) {
      return line.replace(/,\s+/g, ',\n  ')
    }
    return line
  })

  formatted = lines.join('\n')

  // Uppercase keywords if enabled
  if (uppercase) {
    SQL_KEYWORDS.forEach((keyword) => {
      const regex = new RegExp(`\\b${keyword}\\b`, 'gi')
      formatted = formatted.replace(regex, keyword.toUpperCase())
    })

    SQL_FUNCTIONS.forEach((func) => {
      const regex = new RegExp(`\\b${func}\\b(?=\\()`, 'gi')
      formatted = formatted.replace(regex, func.toUpperCase())
    })
  }

  // Proper indentation
  formatted = formatted
    .split('\n')
    .map((line) => {
      const trimmed = line.trim()
      if (!trimmed) return ''

      const indentLevel = determineIndentLevel(trimmed)
      return ' '.repeat(indentLevel * indent) + trimmed
    })
    .join('\n')
    .trim()

  return formatted
}

/**
 * Determine indentation level based on keywords
 */
function determineIndentLevel(line: string): number {
  const upperLine = line.toUpperCase()

  if (upperLine.startsWith('SELECT') || upperLine.startsWith('FROM') || upperLine.startsWith('WHERE')) {
    return 0
  }

  if (upperLine.startsWith('AND') || upperLine.startsWith('OR')) {
    return 1
  }

  if (upperLine.startsWith('GROUP') || upperLine.startsWith('ORDER') || upperLine.startsWith('HAVING')) {
    return 0
  }

  if (upperLine.startsWith('JOIN') || upperLine.startsWith('LEFT') || upperLine.startsWith('RIGHT') || upperLine.startsWith('INNER')) {
    return 0
  }

  return 1
}

/**
 * Validate if text is a valid SQL query (basic check)
 */
export function isValidSQL(sql: string): boolean {
  const trimmed = sql.trim()

  if (trimmed.length === 0) return false

  const firstWord = trimmed.split(/\s+/)[0].toUpperCase()

  const validStarters = [
    'SELECT', 'INSERT', 'UPDATE', 'DELETE', 'CREATE', 'ALTER', 'DROP',
    'WITH', 'DECLARE', 'BEGIN', 'GRANT', 'REVOKE',
  ]

  return validStarters.includes(firstWord)
}

/**
 * Build inline validation diagnostics for SQL editor UX.
 */
export function validateSQL(sql: string): SQLValidationResult {
  const trimmed = sql.trim()

  if (!trimmed) {
    return {
      status: 'empty',
      errors: [],
      warnings: [],
      tips: [],
      badges: [{ label: 'No Query', tone: 'neutral' }],
    }
  }

  const errors: SQLValidationMessage[] = []
  const warnings: SQLValidationMessage[] = []
  const tips: SQLValidationMessage[] = []

  const upperSql = trimmed.toUpperCase()
  const lineCount = trimmed.split('\n').length
  const joinCount = (upperSql.match(/\b(?:INNER\s+|LEFT\s+|RIGHT\s+|FULL\s+)?JOIN\b/g) || []).length

  const openParens = (trimmed.match(/\(/g) || []).length
  const closeParens = (trimmed.match(/\)/g) || []).length
  if (openParens !== closeParens) {
    errors.push({
      level: 'error',
      code: 'PAREN_MISMATCH',
      message: 'Parentheses appear to be unbalanced.',
      detail: `Found ${openParens} opening and ${closeParens} closing parentheses.`,
    })
  }

  const singleQuotes = (trimmed.match(/'/g) || []).length
  if (singleQuotes % 2 !== 0) {
    errors.push({
      level: 'error',
      code: 'QUOTE_MISMATCH',
      message: 'Unterminated single-quoted string detected.',
      detail: 'Check string literals near the end of the query.',
    })
  }

  if (!isValidSQL(trimmed)) {
    errors.push({
      level: 'error',
      code: 'INVALID_STARTER',
      message: 'Query should start with a supported SQL command.',
      detail: 'Expected SELECT, INSERT, UPDATE, DELETE, CREATE, ALTER, DROP, WITH, DECLARE, BEGIN, GRANT, or REVOKE.',
    })
  }

  if (/\bSELECT\b[\s\S]*,\s*(FROM|WHERE|GROUP\s+BY|ORDER\s+BY|HAVING|LIMIT|$)/i.test(trimmed)) {
    errors.push({
      level: 'error',
      code: 'TRAILING_COMMA',
      message: 'Trailing comma found before clause boundary.',
      detail: 'Remove the extra comma in the selected column list.',
    })
  }

  if (!trimmed.endsWith(';')) {
    warnings.push({
      level: 'warning',
      code: 'MISSING_SEMICOLON',
      message: 'Statement does not end with a semicolon.',
      detail: 'Some engines require a semicolon terminator for execution batches.',
    })
  }

  if (/\bSELECT\s+\*/i.test(trimmed)) {
    warnings.push({
      level: 'warning',
      code: 'SELECT_STAR',
      message: 'SELECT * may return unnecessary columns.',
      detail: 'Project only needed columns to reduce I/O and network overhead.',
    })
  }

  if (/\b(UPDATE|DELETE)\b/i.test(trimmed) && !/\bWHERE\b/i.test(trimmed)) {
    warnings.push({
      level: 'warning',
      code: 'NO_WHERE_MUTATION',
      message: 'UPDATE/DELETE without WHERE can affect all rows.',
      detail: 'Add a WHERE clause unless a full-table operation is intentional.',
    })
  }

  if (/\bORDER\s+BY\b/i.test(trimmed) && !/\bLIMIT\b/i.test(trimmed)) {
    tips.push({
      level: 'tip',
      code: 'ORDER_WITHOUT_LIMIT',
      message: 'ORDER BY without LIMIT can be expensive on large datasets.',
      detail: 'Consider limiting rows when only top results are required.',
    })
  }

  if (/\bWHERE\b[\s\S]*\b(UPPER|LOWER|DATE|CAST)\s*\(/i.test(trimmed)) {
    tips.push({
      level: 'tip',
      code: 'FUNCTION_IN_WHERE',
      message: 'Functions in WHERE predicates may prevent index usage.',
      detail: 'Consider computed columns or pre-normalized values for filter predicates.',
    })
  }

  const orCount = (upperSql.match(/\bOR\b/g) || []).length
  if (orCount >= 3) {
    tips.push({
      level: 'tip',
      code: 'OR_CHAIN',
      message: 'Long OR chains can often be rewritten with IN().',
      detail: 'IN clauses are usually easier to read and optimize.',
    })
  }

  const status: ValidationStatus = errors.length > 0 ? 'invalid' : warnings.length > 0 ? 'warning' : 'valid'

  const badges: SQLValidationBadge[] = [
    {
      label: status === 'invalid' ? 'Invalid' : status === 'warning' ? 'Needs Review' : 'Valid',
      tone: status === 'invalid' ? 'error' : status === 'warning' ? 'warning' : 'success',
    },
    { label: `${errors.length} Error${errors.length === 1 ? '' : 's'}`, tone: errors.length ? 'error' : 'neutral' },
    { label: `${warnings.length} Warning${warnings.length === 1 ? '' : 's'}`, tone: warnings.length ? 'warning' : 'neutral' },
    { label: `${tips.length} Tip${tips.length === 1 ? '' : 's'}`, tone: tips.length ? 'info' : 'neutral' },
  ]

  if (lineCount > 10) {
    badges.push({ label: 'Long Query', tone: 'info' })
  }

  if (joinCount >= 3) {
    badges.push({ label: 'Multi-Join', tone: 'info' })
  }

  return {
    status,
    errors,
    warnings,
    tips,
    badges,
  }
}

/**
 * Get SQL query statistics
 */
export function getSQLStats(sql: string): { keywords: number; tables: number; functions: number; lines: number } {
  const upperSql = sql.toUpperCase()

  const keywordMatches = SQL_KEYWORDS.filter((kw) => new RegExp(`\\b${kw}\\b`).test(upperSql)).length

  const fromMatches = (sql.match(/\bFROM\b/gi) || []).length
  const joinMatches = (sql.match(/\b(?:INNER\s+|LEFT\s+|RIGHT\s+|FULL\s+)?JOIN\b/gi) || []).length
  const tableCount = fromMatches + joinMatches

  const functionMatches = SQL_FUNCTIONS.filter((fn) => new RegExp(`\\b${fn}\\s*\\(`, 'i').test(sql)).length

  const lineCount = sql.trim().split('\n').length

  return {
    keywords: keywordMatches,
    tables: tableCount,
    functions: functionMatches,
    lines: lineCount,
  }
}

/**
 * Minify SQL query (remove unnecessary whitespace)
 */
export function minifySQL(sql: string): string {
  return sql
    .replace(/\s+/g, ' ')
    .replace(/\s*([(),])\s*/g, '$1')
    .trim()
}
