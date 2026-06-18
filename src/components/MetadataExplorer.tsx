import React, { useMemo, useState } from 'react'
import { ChevronDown, ChevronRight, Columns, Database, Search, Table2 } from 'lucide-react'
import toast from 'react-hot-toast'
import AIQueryInput from './AIQueryInput'
import { sqlService } from '../services/sqlService'

type ColumnItem = {
  name: string
  type: string
  nullable: boolean
}

type TableItem = {
  name: string
  rowEstimate: number
  columns: ColumnItem[]
}

type SchemaItem = {
  name: string
  tables: TableItem[]
}

const METADATA: SchemaItem[] = [
  {
    name: 'public',
    tables: [
      {
        name: 'users',
        rowEstimate: 12543,
        columns: [
          { name: 'id', type: 'uuid', nullable: false },
          { name: 'email', type: 'varchar(255)', nullable: false },
          { name: 'role', type: 'varchar(50)', nullable: false },
          { name: 'created_at', type: 'timestamp', nullable: false },
        ],
      },
      {
        name: 'orders',
        rowEstimate: 98431,
        columns: [
          { name: 'id', type: 'bigint', nullable: false },
          { name: 'user_id', type: 'uuid', nullable: false },
          { name: 'total_amount', type: 'numeric(10,2)', nullable: false },
          { name: 'status', type: 'varchar(20)', nullable: false },
          { name: 'placed_at', type: 'timestamp', nullable: false },
        ],
      },
    ],
  },
  {
    name: 'analytics',
    tables: [
      {
        name: 'event_stream',
        rowEstimate: 1245000,
        columns: [
          { name: 'event_id', type: 'uuid', nullable: false },
          { name: 'event_name', type: 'varchar(120)', nullable: false },
          { name: 'properties', type: 'jsonb', nullable: true },
          { name: 'occurred_at', type: 'timestamp', nullable: false },
        ],
      },
      {
        name: 'session_rollups',
        rowEstimate: 40221,
        columns: [
          { name: 'session_id', type: 'varchar(64)', nullable: false },
          { name: 'user_id', type: 'uuid', nullable: true },
          { name: 'duration_seconds', type: 'integer', nullable: false },
          { name: 'started_at', type: 'timestamp', nullable: false },
        ],
      },
    ],
  },
]

const MetadataExplorer: React.FC = () => {
  const [query, setQuery] = useState('')
  const [lastPrompt, setLastPrompt] = useState('')
  const [generatedSql, setGeneratedSql] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [expandedSchemas, setExpandedSchemas] = useState<Record<string, boolean>>({
    public: true,
    analytics: true,
  })
  const [expandedTables, setExpandedTables] = useState<Record<string, boolean>>({
    'public.users': true,
    'public.orders': false,
    'analytics.event_stream': true,
    'analytics.session_rollups': false,
  })

  const filteredMetadata = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()

    if (!normalizedQuery) {
      return METADATA
    }

    return METADATA.map((schema) => {
      const tableMatches = schema.tables
        .map((table) => {
          const columnMatches = table.columns.filter((column) =>
            `${column.name} ${column.type}`.toLowerCase().includes(normalizedQuery)
          )

          const tableMatch = table.name.toLowerCase().includes(normalizedQuery)
          if (tableMatch) {
            return table
          }

          if (columnMatches.length > 0) {
            return { ...table, columns: columnMatches }
          }

          return null
        })
        .filter((table): table is TableItem => table !== null)

      const schemaMatch = schema.name.toLowerCase().includes(normalizedQuery)
      if (schemaMatch) {
        return schema
      }

      if (tableMatches.length > 0) {
        return { ...schema, tables: tableMatches }
      }

      return null
    }).filter((schema): schema is SchemaItem => schema !== null)
  }, [query])

  const totalSchemas = filteredMetadata.length
  const totalTables = filteredMetadata.reduce((sum, schema) => sum + schema.tables.length, 0)
  const totalColumns = filteredMetadata.reduce(
    (sum, schema) => sum + schema.tables.reduce((tableSum, table) => tableSum + table.columns.length, 0),
    0
  )

  const aiSuggestions = useMemo(() => {
    const tablePrompts = METADATA.flatMap((schema) =>
      schema.tables.map((table) => `Summarize ${schema.name}.${table.name} and highlight anomalies`)
    )

    const columnPrompts = METADATA.flatMap((schema) =>
      schema.tables.flatMap((table) =>
        table.columns.slice(0, 2).map((column) => `Find trends in ${schema.name}.${table.name}.${column.name}`)
      )
    )

    return [
      'Show weekly active users for the last 12 weeks',
      'Compare order status distribution month over month',
      'List top users by total order amount',
      'Detect unusual spikes in event_stream volume',
      ...tablePrompts,
      ...columnPrompts,
    ]
  }, [])

  const handlePromptSubmit = async (prompt: string) => {
    setIsGenerating(true)

    try {
      const generated = await sqlService.generate({ prompt })
      setLastPrompt(prompt)
      setGeneratedSql(generated.sql)
      toast.success('AI SQL suggestion generated')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to generate SQL')
    } finally {
      setIsGenerating(false)
    }
  }

  const toggleSchema = (schemaName: string) => {
    setExpandedSchemas((prev) => ({
      ...prev,
      [schemaName]: !prev[schemaName],
    }))
  }

  const toggleTable = (schemaName: string, tableName: string) => {
    const key = `${schemaName}.${tableName}`
    setExpandedTables((prev) => ({
      ...prev,
      [key]: !prev[key],
    }))
  }

  const expandAll = () => {
    const nextSchemas: Record<string, boolean> = {}
    const nextTables: Record<string, boolean> = {}

    METADATA.forEach((schema) => {
      nextSchemas[schema.name] = true
      schema.tables.forEach((table) => {
        nextTables[`${schema.name}.${table.name}`] = true
      })
    })

    setExpandedSchemas(nextSchemas)
    setExpandedTables(nextTables)
  }

  const collapseAll = () => {
    const nextSchemas: Record<string, boolean> = {}
    const nextTables: Record<string, boolean> = {}

    METADATA.forEach((schema) => {
      nextSchemas[schema.name] = false
      schema.tables.forEach((table) => {
        nextTables[`${schema.name}.${table.name}`] = false
      })
    })

    setExpandedSchemas(nextSchemas)
    setExpandedTables(nextTables)
  }

  return (
    <section className="card mb-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Metadata Explorer</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Browse schemas, tables, and columns in an expandable tree.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={expandAll}
            className="btn btn-secondary text-sm"
            type="button"
          >
            Expand all
          </button>
          <button
            onClick={collapseAll}
            className="btn btn-secondary text-sm"
            type="button"
          >
            Collapse all
          </button>
        </div>
      </div>

      <AIQueryInput suggestions={aiSuggestions} onSubmit={handlePromptSubmit} />

      {isGenerating ? (
        <div className="mb-5 rounded-lg border border-blue-200 dark:border-blue-800 bg-blue-50/70 dark:bg-blue-900/20 p-4 text-sm text-blue-700 dark:text-blue-300">
          Generating SQL suggestion...
        </div>
      ) : null}

      {generatedSql ? (
        <div className="mb-5 rounded-lg border border-blue-200 dark:border-blue-800 bg-blue-50/70 dark:bg-blue-900/20 p-4">
          <p className="text-xs uppercase tracking-wide text-blue-700 dark:text-blue-300 mb-2">Latest AI Prompt</p>
          <p className="text-sm text-gray-900 dark:text-gray-100 mb-3">{lastPrompt}</p>
          <p className="text-xs uppercase tracking-wide text-gray-600 dark:text-gray-400 mb-2">Suggested SQL</p>
          <pre className="text-xs sm:text-sm rounded-md border border-blue-100 dark:border-blue-900 bg-white dark:bg-dark-900 p-3 overflow-x-auto text-gray-800 dark:text-gray-100">
            <code>{generatedSql}</code>
          </pre>
        </div>
      ) : null}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-5">
        <div className="rounded-lg border border-gray-200 dark:border-dark-700 p-3 bg-gray-50 dark:bg-dark-700/50">
          <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">Schemas</p>
          <p className="mt-1 text-lg font-semibold text-gray-900 dark:text-white">{totalSchemas}</p>
        </div>
        <div className="rounded-lg border border-gray-200 dark:border-dark-700 p-3 bg-gray-50 dark:bg-dark-700/50">
          <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">Tables</p>
          <p className="mt-1 text-lg font-semibold text-gray-900 dark:text-white">{totalTables}</p>
        </div>
        <div className="rounded-lg border border-gray-200 dark:border-dark-700 p-3 bg-gray-50 dark:bg-dark-700/50">
          <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">Columns</p>
          <p className="mt-1 text-lg font-semibold text-gray-900 dark:text-white">{totalColumns}</p>
        </div>
      </div>

      <label className="flex items-center gap-2 mb-4 px-3 py-2 rounded-lg border border-gray-200 dark:border-dark-700 bg-white dark:bg-dark-800">
        <Search size={16} className="text-gray-500 dark:text-gray-400" />
        <input
          type="text"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Filter schemas, tables, or columns"
          className="w-full bg-transparent outline-none text-sm text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
        />
      </label>

      <div className="rounded-lg border border-gray-200 dark:border-dark-700 bg-gray-50 dark:bg-dark-900/40 max-h-[28rem] overflow-auto p-2 sm:p-3">
        {filteredMetadata.length === 0 ? (
          <p className="text-sm text-gray-600 dark:text-gray-400 px-2 py-3">
            No metadata matches your search.
          </p>
        ) : (
          <ul className="space-y-2">
            {filteredMetadata.map((schema) => {
              const schemaExpanded = expandedSchemas[schema.name] ?? false

              return (
                <li key={schema.name} className="rounded-lg border border-gray-200 dark:border-dark-700 bg-white dark:bg-dark-800">
                  <button
                    onClick={() => toggleSchema(schema.name)}
                    className="w-full text-left flex items-center justify-between px-3 py-2.5 hover:bg-gray-50 dark:hover:bg-dark-700 transition-colors"
                    type="button"
                  >
                    <span className="flex items-center gap-2 min-w-0">
                      {schemaExpanded ? (
                        <ChevronDown size={16} className="text-gray-500 dark:text-gray-400 flex-shrink-0" />
                      ) : (
                        <ChevronRight size={16} className="text-gray-500 dark:text-gray-400 flex-shrink-0" />
                      )}
                      <Database size={16} className="text-blue-600 dark:text-blue-400 flex-shrink-0" />
                      <span className="font-medium text-gray-900 dark:text-gray-100 truncate">{schema.name}</span>
                    </span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 ml-2">
                      {schema.tables.length} tables
                    </span>
                  </button>

                  {schemaExpanded && (
                    <ul className="px-2 pb-2 space-y-2">
                      {schema.tables.map((table) => {
                        const tableKey = `${schema.name}.${table.name}`
                        const tableExpanded = expandedTables[tableKey] ?? false

                        return (
                          <li key={table.name} className="rounded-md border border-gray-200 dark:border-dark-700 bg-gray-50 dark:bg-dark-700/40">
                            <button
                              onClick={() => toggleTable(schema.name, table.name)}
                              className="w-full text-left flex items-center justify-between px-3 py-2 hover:bg-gray-100 dark:hover:bg-dark-700 transition-colors"
                              type="button"
                            >
                              <span className="flex items-center gap-2 min-w-0">
                                {tableExpanded ? (
                                  <ChevronDown size={15} className="text-gray-500 dark:text-gray-400 flex-shrink-0" />
                                ) : (
                                  <ChevronRight size={15} className="text-gray-500 dark:text-gray-400 flex-shrink-0" />
                                )}
                                <Table2 size={15} className="text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                                <span className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                                  {table.name}
                                </span>
                              </span>
                              <span className="text-xs text-gray-600 dark:text-gray-400 ml-2 whitespace-nowrap">
                                ~{table.rowEstimate.toLocaleString()} rows
                              </span>
                            </button>

                            {tableExpanded && (
                              <ul className="px-3 pb-2">
                                {table.columns.map((column) => (
                                  <li
                                    key={column.name}
                                    className="flex flex-wrap items-center gap-2 py-1.5 border-t border-gray-200 dark:border-dark-700 first:border-t-0"
                                  >
                                    <Columns size={14} className="text-violet-600 dark:text-violet-400 flex-shrink-0" />
                                    <span className="text-sm text-gray-900 dark:text-gray-100 font-medium">
                                      {column.name}
                                    </span>
                                    <span className="text-xs px-2 py-0.5 rounded-md bg-gray-200 dark:bg-dark-700 text-gray-700 dark:text-gray-300">
                                      {column.type}
                                    </span>
                                    <span
                                      className={`text-xs px-2 py-0.5 rounded-md ${
                                        column.nullable
                                          ? 'bg-amber-100 dark:bg-amber-900 text-amber-700 dark:text-amber-300'
                                          : 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300'
                                      }`}
                                    >
                                      {column.nullable ? 'nullable' : 'not null'}
                                    </span>
                                  </li>
                                ))}
                              </ul>
                            )}
                          </li>
                        )
                      })}
                    </ul>
                  )}
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </section>
  )
}

export default MetadataExplorer
