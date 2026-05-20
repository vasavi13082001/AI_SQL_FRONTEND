import { useState, useCallback, useEffect } from 'react'
import { formatSQL } from './sqlFormatter'

interface QueryHistoryItem {
  id: string
  query: string
  timestamp: number
  formatted: string
  label?: string
}

interface UseSQLQueryOptions {
  maxHistory?: number
  storageKey?: string
  persistToLocalStorage?: boolean
}

/**
 * Custom hook for managing SQL queries with history, formatting, and persistence
 * 
 * @example
 * const {
 *   query,
 *   setQuery,
 *   formatted,
 *   history,
 *   addToHistory,
 *   getFromHistory,
 *   clearHistory,
 *   favorites,
 *   addFavorite,
 *   removeFavorite
 * } = useSQLQuery({ maxHistory: 20 })
 */
export function useSQLQuery(options: UseSQLQueryOptions = {}) {
  const {
    maxHistory = 20,
    storageKey = 'sql-query-history',
    persistToLocalStorage = true,
  } = options

  const [query, setQuery] = useState('')
  const [history, setHistory] = useState<QueryHistoryItem[]>([])
  const [favorites, setFavorites] = useState<QueryHistoryItem[]>([])

  // Load from localStorage on mount
  useEffect(() => {
    if (!persistToLocalStorage) return

    try {
      const savedHistory = localStorage.getItem(storageKey)
      if (savedHistory) {
        const parsed = JSON.parse(savedHistory)
        if (Array.isArray(parsed)) {
          setHistory(parsed.slice(0, maxHistory))
        }
      }

      const savedFavorites = localStorage.getItem(`${storageKey}-favorites`)
      if (savedFavorites) {
        const parsed = JSON.parse(savedFavorites)
        if (Array.isArray(parsed)) {
          setFavorites(parsed)
        }
      }
    } catch (error) {
      console.error('Failed to load query history:', error)
    }
  }, [storageKey, persistToLocalStorage, maxHistory])

  // Save to localStorage whenever history changes
  useEffect(() => {
    if (!persistToLocalStorage) return

    try {
      localStorage.setItem(storageKey, JSON.stringify(history))
    } catch (error) {
      console.error('Failed to save query history:', error)
    }
  }, [history, storageKey, persistToLocalStorage])

  // Save favorites whenever they change
  useEffect(() => {
    if (!persistToLocalStorage) return

    try {
      localStorage.setItem(`${storageKey}-favorites`, JSON.stringify(favorites))
    } catch (error) {
      console.error('Failed to save favorites:', error)
    }
  }, [favorites, storageKey, persistToLocalStorage])

  // Format current query
  const formatted = query.trim() ? formatSQL(query) : ''

  // Add query to history
  const addToHistory = useCallback(
    (q: string, label?: string) => {
      if (!q.trim()) return

      const newItem: QueryHistoryItem = {
        id: `${Date.now()}-${Math.random()}`,
        query: q,
        formatted: formatSQL(q),
        timestamp: Date.now(),
        label,
      }

      setHistory((prev) => {
        const updated = [newItem, ...prev.filter((item) => item.query !== q)].slice(0, maxHistory)
        return updated
      })
    },
    [maxHistory]
  )

  // Get query from history by index
  const getFromHistory = useCallback((index: number) => {
    setHistory((prev) => {
      if (index >= 0 && index < prev.length) {
        setQuery(prev[index].query)
      }
      return prev
    })
  }, [])

  // Remove item from history
  const removeFromHistory = useCallback((id: string) => {
    setHistory((prev) => prev.filter((item) => item.id !== id))
  }, [])

  // Clear all history
  const clearHistory = useCallback(() => {
    setHistory([])
  }, [])

  // Add to favorites
  const addFavorite = useCallback(
    (q?: string, label?: string) => {
      const queryToSave = q || query
      if (!queryToSave.trim()) return

      const newFavorite: QueryHistoryItem = {
        id: `fav-${Date.now()}-${Math.random()}`,
        query: queryToSave,
        formatted: formatSQL(queryToSave),
        timestamp: Date.now(),
        label: label || `Query ${favorites.length + 1}`,
      }

      setFavorites((prev) => {
        const exists = prev.some((item) => item.query === queryToSave)
        return exists ? prev : [newFavorite, ...prev]
      })
    },
    [query, favorites.length]
  )

  // Remove from favorites
  const removeFavorite = useCallback((id: string) => {
    setFavorites((prev) => prev.filter((item) => item.id !== id))
  }, [])

  // Update favorite label
  const updateFavoriteLabel = useCallback((id: string, newLabel: string) => {
    setFavorites((prev) =>
      prev.map((item) => (item.id === id ? { ...item, label: newLabel } : item))
    )
  }, [])

  // Check if current query is in favorites
  const isFavorited = favorites.some((item) => item.query === query)

  // Search history
  const searchHistory = useCallback((searchTerm: string) => {
    const term = searchTerm.toLowerCase()
    return history.filter(
      (item) =>
        item.query.toLowerCase().includes(term) ||
        item.label?.toLowerCase().includes(term)
    )
  }, [history])

  // Search favorites
  const searchFavorites = useCallback((searchTerm: string) => {
    const term = searchTerm.toLowerCase()
    return favorites.filter(
      (item) =>
        item.query.toLowerCase().includes(term) ||
        item.label?.toLowerCase().includes(term)
    )
  }, [favorites])

  // Export query as file
  const exportQuery = useCallback((filename = 'query.sql') => {
    if (!query.trim()) return

    const element = document.createElement('a')
    const file = new Blob([formatted || query], { type: 'text/sql' })
    element.href = URL.createObjectURL(file)
    element.download = filename
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)
  }, [query, formatted])

  // Import query from file
  const importQuery = useCallback(
    (file: File): Promise<void> => {
      return new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = (e) => {
          try {
            const content = e.target?.result as string
            setQuery(content)
            addToHistory(content, file.name.replace('.sql', ''))
            resolve()
          } catch (error) {
            reject(error)
          }
        }
        reader.onerror = () => reject(reader.error)
        reader.readAsText(file)
      })
    },
    [addToHistory]
  )

  return {
    // Query state
    query,
    setQuery,
    formatted,

    // History management
    history,
    addToHistory,
    getFromHistory,
    removeFromHistory,
    clearHistory,
    searchHistory,

    // Favorites management
    favorites,
    addFavorite,
    removeFavorite,
    updateFavoriteLabel,
    isFavorited,
    searchFavorites,

    // Utilities
    exportQuery,
    importQuery,
  }
}

export default useSQLQuery
