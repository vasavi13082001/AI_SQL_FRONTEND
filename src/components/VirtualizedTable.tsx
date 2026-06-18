import { memo } from 'react'
import { FixedSizeList, type ListChildComponentProps } from 'react-window'
import type { SQLExecutionResultRow } from '../types/api'

type VirtualizedTableProps = {
  columns: string[]
  rows: SQLExecutionResultRow[]
  height?: number
}

const Row = ({ index, style, data }: ListChildComponentProps<{ columns: string[]; rows: SQLExecutionResultRow[] }>) => {
  const row = data.rows[index]

  return (
    <div style={style} className="grid border-b border-gray-100 dark:border-dark-700" role="row">
      <div className="grid" style={{ gridTemplateColumns: `repeat(${data.columns.length}, minmax(0, 1fr))` }}>
        {data.columns.map((column) => (
          <div key={`${index}-${column}`} className="px-3 py-2 text-xs text-gray-800 dark:text-gray-100 truncate">
            {String(row[column] ?? '')}
          </div>
        ))}
      </div>
    </div>
  )
}

const VirtualizedTable = ({ columns, rows, height = 320 }: VirtualizedTableProps) => {
  if (rows.length === 0) {
    return (
      <div className="rounded-lg border border-gray-200 dark:border-dark-700 p-6 text-sm text-gray-500 dark:text-gray-400 text-center">
        No rows returned for this execution.
      </div>
    )
  }

  return (
    <div className="rounded-lg border border-gray-200 dark:border-dark-700 overflow-hidden">
      <div className="grid bg-gray-100 dark:bg-dark-700" style={{ gridTemplateColumns: `repeat(${columns.length}, minmax(0, 1fr))` }} role="rowgroup">
        {columns.map((column) => (
          <div key={column} className="px-3 py-2 text-xs font-semibold uppercase tracking-wide text-gray-700 dark:text-gray-300" role="columnheader">
            {column}
          </div>
        ))}
      </div>

      <FixedSizeList
        height={height}
        itemCount={rows.length}
        itemData={{ columns, rows }}
        itemSize={38}
        width="100%"
      >
        {Row}
      </FixedSizeList>
    </div>
  )
}

export default memo(VirtualizedTable)
