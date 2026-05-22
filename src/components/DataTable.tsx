import React, { useEffect, useMemo, useState } from 'react'
import { ArrowDown, ArrowUp, ArrowUpDown, Download, Search } from 'lucide-react'

type SortDirection = 'asc' | 'desc'

export type DataTableColumn<T extends Record<string, unknown>> = {
  key: keyof T
  header: string
  sortable?: boolean
  className?: string
  render?: (value: T[keyof T], row: T) => React.ReactNode
  csvValue?: (value: T[keyof T], row: T) => string | number
}

type DataTableProps<T extends Record<string, unknown>> = {
  title?: string
  data: T[]
  columns: Array<DataTableColumn<T>>
  searchable?: boolean
  searchPlaceholder?: string
  exportFileName?: string
  defaultRowsPerPage?: number
  rowsPerPageOptions?: number[]
  emptyMessage?: string
}

const normalizeValue = (value: unknown): string => {
  if (value === null || value === undefined) {
    return ''
  }

  if (typeof value === 'string') {
    return value
  }

  if (typeof value === 'number' || typeof value === 'boolean' || typeof value === 'bigint') {
    return String(value)
  }

  if (value instanceof Date) {
    return value.toISOString()
  }

  return JSON.stringify(value)
}

const isNumericString = (value: string): boolean => /^-?\d+(\.\d+)?$/.test(value)

const compareValues = (a: unknown, b: unknown): number => {
  if (typeof a === 'number' && typeof b === 'number') {
    return a - b
  }

  if (a instanceof Date && b instanceof Date) {
    return a.getTime() - b.getTime()
  }

  const left = normalizeValue(a)
  const right = normalizeValue(b)

  if (isNumericString(left) && isNumericString(right)) {
    return Number(left) - Number(right)
  }

  return left.localeCompare(right, undefined, { numeric: true, sensitivity: 'base' })
}

const escapeCSV = (value: string | number): string => {
  const text = String(value)
  const escaped = text.replace(/"/g, '""')
  return `"${escaped}"`
}

function DataTable<T extends Record<string, unknown>>({
  title,
  data,
  columns,
  searchable = true,
  searchPlaceholder = 'Filter rows...',
  exportFileName = 'table-export.csv',
  defaultRowsPerPage = 5,
  rowsPerPageOptions = [5, 10, 20, 50],
  emptyMessage = 'No rows match your filters.',
}: DataTableProps<T>) {
  const [query, setQuery] = useState('')
  const [sortKey, setSortKey] = useState<keyof T | null>(null)
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc')
  const [currentPage, setCurrentPage] = useState(1)
  const [rowsPerPage, setRowsPerPage] = useState(defaultRowsPerPage)

  const filteredData = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()

    if (!normalizedQuery) {
      return data
    }

    return data.filter((row) =>
      columns.some((column) => {
        const raw = row[column.key]
        return normalizeValue(raw).toLowerCase().includes(normalizedQuery)
      }),
    )
  }, [columns, data, query])

  const sortedData = useMemo(() => {
    if (!sortKey) {
      return filteredData
    }

    const sorted = [...filteredData].sort((leftRow, rightRow) => compareValues(leftRow[sortKey], rightRow[sortKey]))
    return sortDirection === 'asc' ? sorted : sorted.reverse()
  }, [filteredData, sortDirection, sortKey])

  const totalPages = Math.max(1, Math.ceil(sortedData.length / rowsPerPage))

  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * rowsPerPage
    return sortedData.slice(start, start + rowsPerPage)
  }, [currentPage, rowsPerPage, sortedData])

  useEffect(() => {
    setCurrentPage(1)
  }, [query, rowsPerPage])

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages)
    }
  }, [currentPage, totalPages])

  const handleSort = (key: keyof T, sortable = true) => {
    if (!sortable) {
      return
    }

    if (sortKey === key) {
      setSortDirection((current) => (current === 'asc' ? 'desc' : 'asc'))
      return
    }

    setSortKey(key)
    setSortDirection('asc')
  }

  const handleExportCSV = () => {
    const header = columns.map((column) => escapeCSV(column.header)).join(',')
    const rows = sortedData.map((row) => {
      const values = columns.map((column) => {
        const value = row[column.key]
        const csvValue = column.csvValue ? column.csvValue(value, row) : normalizeValue(value)
        return escapeCSV(csvValue)
      })

      return values.join(',')
    })

    const content = [header, ...rows].join('\n')
    const blob = new Blob(['\uFEFF' + content], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = exportFileName.endsWith('.csv') ? exportFileName : `${exportFileName}.csv`
    anchor.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {title ? <h2 className="text-xl font-bold text-gray-900 dark:text-white">{title}</h2> : <div />}

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          {searchable && (
            <label className="relative block">
              <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400" />
              <input
                type="text"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder={searchPlaceholder}
                className="w-full rounded-lg border border-gray-300 bg-white py-2 pl-9 pr-3 text-sm text-gray-900 outline-none transition-colors focus:border-blue-500 dark:border-dark-600 dark:bg-dark-700 dark:text-gray-100 sm:w-64"
              />
            </label>
          )}

          <button type="button" onClick={handleExportCSV} className="btn btn-secondary flex items-center justify-center gap-2 text-sm">
            <Download size={16} />
            Export CSV
          </button>
        </div>
      </div>

      <div className="overflow-hidden rounded-lg border border-gray-200 dark:border-dark-700">
        <div className="max-h-[26rem] overflow-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-gray-200 dark:border-dark-700">
              <tr>
                {columns.map((column) => {
                  const isActiveSort = sortKey === column.key
                  const canSort = column.sortable !== false

                  return (
                    <th key={String(column.key)} className="sticky top-0 z-10 bg-gray-100 px-4 py-3 text-left font-semibold text-gray-700 dark:bg-dark-700 dark:text-gray-300">
                      <button
                        type="button"
                        className={`flex items-center gap-2 ${canSort ? 'cursor-pointer' : 'cursor-default'}`}
                        onClick={() => handleSort(column.key, canSort)}
                      >
                        <span>{column.header}</span>
                        {canSort &&
                          (isActiveSort ? (
                            sortDirection === 'asc' ? (
                              <ArrowUp size={14} />
                            ) : (
                              <ArrowDown size={14} />
                            )
                          ) : (
                            <ArrowUpDown size={14} className="opacity-70" />
                          ))}
                      </button>
                    </th>
                  )
                })}
              </tr>
            </thead>
            <tbody>
              {paginatedData.length > 0 ? (
                paginatedData.map((row, rowIndex) => (
                  <tr key={rowIndex} className="border-b border-gray-100 transition-colors hover:bg-gray-50 dark:border-dark-700 dark:hover:bg-dark-700/50">
                    {columns.map((column) => {
                      const value = row[column.key]

                      return (
                        <td key={String(column.key)} className={`px-4 py-3 text-gray-900 dark:text-gray-100 ${column.className ?? ''}`}>
                          {column.render ? column.render(value, row) : normalizeValue(value)}
                        </td>
                      )
                    })}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={columns.length} className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                    {emptyMessage}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex flex-col gap-3 text-sm sm:flex-row sm:items-center sm:justify-between">
        <p className="text-gray-600 dark:text-gray-400">
          Showing {sortedData.length === 0 ? 0 : (currentPage - 1) * rowsPerPage + 1} to {Math.min(currentPage * rowsPerPage, sortedData.length)} of {sortedData.length} rows
        </p>

        <div className="flex items-center gap-2">
          <label className="text-gray-600 dark:text-gray-400" htmlFor="rows-per-page">
            Rows:
          </label>
          <select
            id="rows-per-page"
            value={rowsPerPage}
            onChange={(event) => setRowsPerPage(Number(event.target.value))}
            className="rounded-lg border border-gray-300 bg-white px-2 py-1 text-gray-900 dark:border-dark-600 dark:bg-dark-700 dark:text-gray-100"
          >
            {rowsPerPageOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
            disabled={currentPage <= 1}
            className="btn btn-secondary px-3 py-1 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Prev
          </button>
          <span className="min-w-16 text-center text-gray-700 dark:text-gray-300">
            {currentPage} / {totalPages}
          </span>
          <button
            type="button"
            onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
            disabled={currentPage >= totalPages}
            className="btn btn-secondary px-3 py-1 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  )
}

export default DataTable