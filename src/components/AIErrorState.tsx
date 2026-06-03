import React from 'react'
import { AlertTriangle, LifeBuoy, RefreshCcw, Wrench } from 'lucide-react'

type AIErrorCode = 'network' | 'timeout' | 'rate_limit' | 'permission' | 'schema' | 'unknown'

export type AIErrorDetails = {
  code: AIErrorCode
  title: string
  summary: string
  requestId: string
  sourcePrompt?: string
  retryLabel?: string
  suggestions: string[]
  troubleshooting: string[]
}

type AIErrorStateProps = {
  error: AIErrorDetails
  onRetry: () => void
  onUseSuggestion: (suggestion: string) => void
}

const AIErrorState: React.FC<AIErrorStateProps> = ({ error, onRetry, onUseSuggestion }) => {
  return (
    <section className="ai-error-shell" role="alert" aria-live="polite">
      <div className="ai-error-header">
        <div className="ai-error-icon-wrap" aria-hidden="true">
          <AlertTriangle size={18} />
        </div>
        <div>
          <p className="ai-error-eyebrow">AI response interrupted</p>
          <h3 className="ai-error-title">{error.title}</h3>
          <p className="ai-error-summary">{error.summary}</p>
        </div>
      </div>

      <div className="ai-error-meta">
        <span className="ai-error-badge">Code: {error.code.replace('_', ' ')}</span>
        <span className="ai-error-badge">Request ID: {error.requestId}</span>
      </div>

      <div className="ai-error-grid">
        <div className="ai-error-panel">
          <p className="ai-error-panel-title">
            <LifeBuoy size={14} />
            Try one of these prompts
          </p>
          <div className="flex flex-wrap gap-2">
            {error.suggestions.map((suggestion) => (
              <button
                key={suggestion}
                type="button"
                onClick={() => onUseSuggestion(suggestion)}
                className="ai-error-chip"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>

        <div className="ai-error-panel">
          <p className="ai-error-panel-title">
            <Wrench size={14} />
            Troubleshooting guidance
          </p>
          <ul className="ai-error-list">
            {error.troubleshooting.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      </div>

      <div className="mt-4 flex justify-end">
        <button type="button" onClick={onRetry} className="ai-error-retry-btn">
          <RefreshCcw size={14} />
          {error.retryLabel || 'Retry request'}
        </button>
      </div>
    </section>
  )
}

export default AIErrorState
