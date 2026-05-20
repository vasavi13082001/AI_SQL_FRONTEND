/**
 * SQL Formatter utility for formatting SQL queries
 */

interface FormatterOptions {
  indent?: number
  uppercase?: boolean
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
