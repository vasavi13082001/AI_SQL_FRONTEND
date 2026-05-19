import React, { useEffect, useMemo, useRef, useState } from 'react'
import { History, Loader2, Sparkles } from 'lucide-react'

type AIQueryInputProps = {
  suggestions: string[]
  onSubmit: (prompt: string) => Promise<void> | void
}

const HISTORY_STORAGE_KEY = 'ai-query-history'
const HISTORY_LIMIT = 8

const AIQueryInput: React.FC<AIQueryInputProps> = ({ suggestions, onSubmit }) => {
  const [prompt, setPrompt] = useState('')
  const [isFocused, setIsFocused] = useState(false)
  const [activeIndex, setActiveIndex] = useState(-1)
  const [isLoading, setIsLoading] = useState(false)
  const [promptHistory, setPromptHistory] = useState<string[]>([])

  const containerRef = useRef<HTMLDivElement | null>(null)
  const inputRef = useRef<HTMLInputElement | null>(null)

  useEffect(() => {
    try {
      const savedHistory = localStorage.getItem(HISTORY_STORAGE_KEY)
      if (!savedHistory) {
        return
      }

      const parsedHistory = JSON.parse(savedHistory)
      if (Array.isArray(parsedHistory)) {
        setPromptHistory(parsedHistory.filter((item): item is string => typeof item === 'string').slice(0, HISTORY_LIMIT))
      }
    } catch {
      setPromptHistory([])
    }
  }, [])

  useEffect(() => {
    const handleGlobalShortcut = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        inputRef.current?.focus()
      }
    }

    window.addEventListener('keydown', handleGlobalShortcut)
    return () => {
      window.removeEventListener('keydown', handleGlobalShortcut)
    }
  }, [])

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      const targetNode = event.target as Node
      if (containerRef.current && !containerRef.current.contains(targetNode)) {
        setIsFocused(false)
        setActiveIndex(-1)
      }
    }

    window.addEventListener('mousedown', handleOutsideClick)
    return () => {
      window.removeEventListener('mousedown', handleOutsideClick)
    }
  }, [])

  const filteredSuggestions = useMemo(() => {
    const normalizedPrompt = prompt.trim().toLowerCase()
    if (!normalizedPrompt) {
      return []
    }

    const uniqueSuggestions = Array.from(new Set(suggestions))

    return uniqueSuggestions
      .filter((suggestion) => suggestion.toLowerCase().includes(normalizedPrompt))
      .sort((left, right) => {
        const leftStartsWith = left.toLowerCase().startsWith(normalizedPrompt)
        const rightStartsWith = right.toLowerCase().startsWith(normalizedPrompt)

        if (leftStartsWith && !rightStartsWith) {
          return -1
        }

        if (!leftStartsWith && rightStartsWith) {
          return 1
        }

        return left.length - right.length
      })
      .slice(0, 6)
  }, [prompt, suggestions])

  const showSuggestionList = isFocused && filteredSuggestions.length > 0
  const showHistoryList = isFocused && !prompt.trim() && promptHistory.length > 0
  const dropdownItems = showSuggestionList ? filteredSuggestions : showHistoryList ? promptHistory : []

  useEffect(() => {
    setActiveIndex(-1)
  }, [prompt])

  const persistPrompt = (value: string) => {
    const trimmedValue = value.trim()
    if (!trimmedValue) {
      return
    }

    setPromptHistory((previous) => {
      const nextHistory = [trimmedValue, ...previous.filter((item) => item !== trimmedValue)].slice(0, HISTORY_LIMIT)
      localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(nextHistory))
      return nextHistory
    })
  }

  const runPrompt = async () => {
    const trimmedPrompt = prompt.trim()

    if (!trimmedPrompt || isLoading) {
      return
    }

    setIsLoading(true)
    setIsFocused(false)
    setActiveIndex(-1)

    try {
      await Promise.all([
        Promise.resolve(onSubmit(trimmedPrompt)),
        new Promise((resolve) => setTimeout(resolve, 700)),
      ])
      persistPrompt(trimmedPrompt)
    } finally {
      setIsLoading(false)
    }
  }

  const applySelection = (value: string) => {
    setPrompt(value)
    inputRef.current?.focus()
    setIsFocused(true)
    setActiveIndex(-1)
  }

  const handleInputKeyDown = async (event: React.KeyboardEvent<HTMLInputElement>) => {
    if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
      event.preventDefault()
      await runPrompt()
      return
    }

    if (event.key === 'Escape') {
      setIsFocused(false)
      setActiveIndex(-1)
      return
    }

    if (dropdownItems.length > 0 && event.key === 'ArrowDown') {
      event.preventDefault()
      setActiveIndex((previous) => (previous + 1) % dropdownItems.length)
      return
    }

    if (dropdownItems.length > 0 && event.key === 'ArrowUp') {
      event.preventDefault()
      setActiveIndex((previous) => (previous <= 0 ? dropdownItems.length - 1 : previous - 1))
      return
    }

    if (event.key === 'Enter') {
      event.preventDefault()
      if (activeIndex >= 0 && dropdownItems[activeIndex]) {
        applySelection(dropdownItems[activeIndex])
        return
      }

      await runPrompt()
    }
  }

  return (
    <div ref={containerRef} className="mb-6 rounded-xl border border-gray-200 dark:border-dark-700 bg-white dark:bg-dark-800 p-4 shadow-sm">
      <div className="flex items-start justify-between gap-4 mb-3">
        <div>
          <h3 className="text-base font-semibold text-gray-900 dark:text-white">AI Query Assistant</h3>
          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
            Ctrl/Cmd+K focuses input. Enter applies highlighted suggestion. Ctrl/Cmd+Enter runs.
          </p>
        </div>
        {isLoading ? (
          <div className="flex items-center gap-2 text-sm text-blue-600 dark:text-blue-300">
            <Loader2 size={16} className="animate-spin" />
            <span className="inline-flex items-center gap-1">
              Thinking
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-current animate-bounce" style={{ animationDelay: '0ms' }}></span>
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-current animate-bounce" style={{ animationDelay: '120ms' }}></span>
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-current animate-bounce" style={{ animationDelay: '240ms' }}></span>
            </span>
          </div>
        ) : null}
      </div>

      <div className="relative">
        <label className="flex items-center gap-2 rounded-lg border border-gray-200 dark:border-dark-700 bg-gray-50 dark:bg-dark-900 px-3 py-2.5">
          <Sparkles size={16} className="text-blue-600 dark:text-blue-400 flex-shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={prompt}
            placeholder="Ask: Show monthly revenue by plan tier"
            onFocus={() => setIsFocused(true)}
            onChange={(event) => setPrompt(event.target.value)}
            onKeyDown={handleInputKeyDown}
            className="w-full bg-transparent outline-none text-sm text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
          />
        </label>

        {(showSuggestionList || showHistoryList) && (
          <ul className="absolute z-20 mt-2 w-full rounded-lg border border-gray-200 dark:border-dark-700 bg-white dark:bg-dark-800 shadow-lg overflow-hidden">
            {dropdownItems.map((item, index) => (
              <li key={`${item}-${index}`}>
                <button
                  type="button"
                  onMouseDown={(event) => {
                    event.preventDefault()
                    applySelection(item)
                  }}
                  className={`w-full text-left px-3 py-2 text-sm transition-colors flex items-center gap-2 ${
                    activeIndex === index
                      ? 'bg-blue-50 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300'
                      : 'text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-dark-700'
                  }`}
                >
                  {showHistoryList ? (
                    <History size={14} className="flex-shrink-0 text-gray-500 dark:text-gray-400" />
                  ) : (
                    <Sparkles size={14} className="flex-shrink-0 text-blue-600 dark:text-blue-400" />
                  )}
                  <span className="truncate">{item}</span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="mt-3 flex items-center justify-between gap-3">
        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
          {showHistoryList ? 'Prompt history is shown. Type to switch to autocomplete suggestions.' : 'Try: users, orders, revenue, sessions'}
        </p>
        <button
          type="button"
          onClick={() => {
            void runPrompt()
          }}
          disabled={!prompt.trim() || isLoading}
          className="btn btn-primary text-sm disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Running...' : 'Run Query'}
        </button>
      </div>
    </div>
  )
}

export default AIQueryInput