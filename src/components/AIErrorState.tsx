import React, { useCallback, useEffect, useRef, useState } from 'react'
import {
  AlertTriangle,
  Check,
  ChevronDown,
  Clock,
  Code2,
  Copy,
  Database,
  Gauge,
  LifeBuoy,
  Loader2,
  RefreshCcw,
  Shield,
  WifiOff,
  Wrench,
  X,
} from 'lucide-react'

// ─── Types ─────────────────────────────────────────────────────────────────────

export type AIErrorCode =
  | 'network'
  | 'timeout'
  | 'rate_limit'
  | 'permission'
  | 'schema'
  | 'parse'
  | 'unknown'

export type AIErrorSeverity = 'warning' | 'error' | 'critical'

export type AIErrorDetails = {
  code: AIErrorCode
  title: string
  summary: string
  requestId: string
  sourcePrompt?: string
  retryLabel?: string
  severity?: AIErrorSeverity
  suggestions: string[]
  troubleshooting: string[]
  /** Auto-retry countdown in seconds. Pass undefined to disable. */
  autoRetryIn?: number
}

type AIErrorStateProps = {
  error: AIErrorDetails
  onRetry: () => void
  onUseSuggestion: (suggestion: string) => void
  onDismiss?: () => void
  className?: string
}

// ─── Variant config ────────────────────────────────────────────────────────────

type ErrorVariant = {
  Icon: React.ComponentType<{ size?: number }>
  eyebrow: string
  iconClass: string
  shellGradient: string
  borderClass: string
  badgeClass: string
  retryClass: string
  chipClass: string
  bulletColor: string
  severityDefault: AIErrorSeverity
}

const VARIANTS: Record<AIErrorCode, ErrorVariant> = {
  network: {
    Icon: WifiOff,
    eyebrow: 'Network error',
    iconClass: 'bg-rose-100 text-rose-600 dark:bg-rose-900/40 dark:text-rose-300',
    shellGradient: 'from-rose-50 via-white to-pink-50 dark:from-rose-950/30 dark:via-dark-900/95 dark:to-pink-950/20',
    borderClass: 'border-rose-200/80 dark:border-rose-500/30',
    badgeClass: 'border-rose-300/70 dark:border-rose-400/40 text-rose-800 dark:text-rose-200',
    retryClass: 'bg-rose-600 hover:bg-rose-700 focus-visible:ring-rose-500',
    chipClass:
      'border-rose-300/80 dark:border-rose-500/40 bg-rose-50 dark:bg-rose-900/30 text-rose-800 dark:text-rose-100 hover:bg-rose-100 dark:hover:bg-rose-900/50',
    bulletColor: '#f43f5e',
    severityDefault: 'error',
  },
  timeout: {
    Icon: Clock,
    eyebrow: 'Request timed out',
    iconClass: 'bg-orange-100 text-orange-600 dark:bg-orange-900/40 dark:text-orange-300',
    shellGradient:
      'from-orange-50 via-white to-amber-50 dark:from-orange-950/30 dark:via-dark-900/95 dark:to-amber-950/20',
    borderClass: 'border-orange-200/80 dark:border-orange-500/30',
    badgeClass: 'border-orange-300/70 dark:border-orange-400/40 text-orange-800 dark:text-orange-200',
    retryClass: 'bg-orange-600 hover:bg-orange-700 focus-visible:ring-orange-500',
    chipClass:
      'border-orange-300/80 dark:border-orange-500/40 bg-orange-50 dark:bg-orange-900/30 text-orange-800 dark:text-orange-100 hover:bg-orange-100 dark:hover:bg-orange-900/50',
    bulletColor: '#f97316',
    severityDefault: 'warning',
  },
  rate_limit: {
    Icon: Gauge,
    eyebrow: 'Rate limit reached',
    iconClass: 'bg-violet-100 text-violet-600 dark:bg-violet-900/40 dark:text-violet-300',
    shellGradient:
      'from-violet-50 via-white to-purple-50 dark:from-violet-950/30 dark:via-dark-900/95 dark:to-purple-950/20',
    borderClass: 'border-violet-200/80 dark:border-violet-500/30',
    badgeClass: 'border-violet-300/70 dark:border-violet-400/40 text-violet-800 dark:text-violet-200',
    retryClass: 'bg-violet-600 hover:bg-violet-700 focus-visible:ring-violet-500',
    chipClass:
      'border-violet-300/80 dark:border-violet-500/40 bg-violet-50 dark:bg-violet-900/30 text-violet-800 dark:text-violet-100 hover:bg-violet-100 dark:hover:bg-violet-900/50',
    bulletColor: '#7c3aed',
    severityDefault: 'warning',
  },
  permission: {
    Icon: Shield,
    eyebrow: 'Access denied',
    iconClass: 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-200',
    shellGradient:
      'from-slate-50 via-white to-gray-50 dark:from-slate-900/40 dark:via-dark-900/95 dark:to-gray-950/20',
    borderClass: 'border-slate-200/80 dark:border-slate-600/40',
    badgeClass: 'border-slate-300/70 dark:border-slate-500/40 text-slate-700 dark:text-slate-300',
    retryClass:
      'bg-slate-700 hover:bg-slate-800 dark:bg-slate-600 dark:hover:bg-slate-500 focus-visible:ring-slate-500',
    chipClass:
      'border-slate-300/80 dark:border-slate-600/40 bg-slate-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700/60',
    bulletColor: '#475569',
    severityDefault: 'critical',
  },
  schema: {
    Icon: Database,
    eyebrow: 'Schema error',
    iconClass: 'bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-300',
    shellGradient:
      'from-blue-50 via-white to-indigo-50 dark:from-blue-950/30 dark:via-dark-900/95 dark:to-indigo-950/20',
    borderClass: 'border-blue-200/80 dark:border-blue-500/30',
    badgeClass: 'border-blue-300/70 dark:border-blue-400/40 text-blue-800 dark:text-blue-200',
    retryClass: 'bg-blue-600 hover:bg-blue-700 focus-visible:ring-blue-500',
    chipClass:
      'border-blue-300/80 dark:border-blue-500/40 bg-blue-50 dark:bg-blue-900/30 text-blue-800 dark:text-blue-100 hover:bg-blue-100 dark:hover:bg-blue-900/50',
    bulletColor: '#2563eb',
    severityDefault: 'error',
  },
  parse: {
    Icon: Code2,
    eyebrow: 'Parse error',
    iconClass: 'bg-cyan-100 text-cyan-600 dark:bg-cyan-900/40 dark:text-cyan-300',
    shellGradient:
      'from-cyan-50 via-white to-teal-50 dark:from-cyan-950/30 dark:via-dark-900/95 dark:to-teal-950/20',
    borderClass: 'border-cyan-200/80 dark:border-cyan-500/30',
    badgeClass: 'border-cyan-300/70 dark:border-cyan-400/40 text-cyan-800 dark:text-cyan-200',
    retryClass: 'bg-cyan-600 hover:bg-cyan-700 focus-visible:ring-cyan-500',
    chipClass:
      'border-cyan-300/80 dark:border-cyan-500/40 bg-cyan-50 dark:bg-cyan-900/30 text-cyan-800 dark:text-cyan-100 hover:bg-cyan-100 dark:hover:bg-cyan-900/50',
    bulletColor: '#0891b2',
    severityDefault: 'warning',
  },
  unknown: {
    Icon: AlertTriangle,
    eyebrow: 'AI response interrupted',
    iconClass: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-200',
    shellGradient:
      'from-amber-50 via-white to-orange-50 dark:from-amber-950/25 dark:via-dark-900/95 dark:to-orange-950/25',
    borderClass: 'border-amber-200/80 dark:border-amber-500/30',
    badgeClass: 'border-amber-300/70 dark:border-amber-400/40 text-amber-800 dark:text-amber-200',
    retryClass: 'bg-amber-600 hover:bg-amber-700 focus-visible:ring-amber-500',
    chipClass:
      'border-amber-300/80 dark:border-amber-500/40 bg-amber-50 dark:bg-amber-900/30 text-amber-800 dark:text-amber-100 hover:bg-amber-100 dark:hover:bg-amber-900/50',
    bulletColor: '#d97706',
    severityDefault: 'warning',
  },
}

const SEVERITY_CONFIG: Record<AIErrorSeverity, { label: string; cls: string }> = {
  warning: {
    label: 'Warning',
    cls: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
  },
  error: {
    label: 'Error',
    cls: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300',
  },
  critical: {
    label: 'Critical',
    cls: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-200',
  },
}

// ─── Sub-components ────────────────────────────────────────────────────────────

const SeverityBadge: React.FC<{ severity: AIErrorSeverity }> = ({ severity }) => {
  const { label, cls } = SEVERITY_CONFIG[severity]
  return (
    <span className={`rounded-full px-2 py-0.5 text-[10px] uppercase tracking-wider font-bold ${cls}`}>
      {label}
    </span>
  )
}

const CircularCountdown: React.FC<{ total: number; remaining: number }> = ({ total, remaining }) => {
  const radius = 9
  const circumference = 2 * Math.PI * radius
  const dashoffset = circumference * (1 - remaining / total)
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" className="-rotate-90 flex-shrink-0" aria-hidden="true">
      <circle cx="12" cy="12" r={radius} fill="none" stroke="currentColor" strokeWidth="2.5" className="opacity-20" />
      <circle
        cx="12"
        cy="12"
        r={radius}
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeDasharray={circumference}
        strokeDashoffset={dashoffset}
        strokeLinecap="round"
        style={{ transition: 'stroke-dashoffset 0.9s linear' }}
      />
    </svg>
  )
}

// ─── Main component ────────────────────────────────────────────────────────────

const AIErrorState: React.FC<AIErrorStateProps> = ({
  error,
  onRetry,
  onUseSuggestion,
  onDismiss,
  className = '',
}) => {
  const variant = VARIANTS[error.code] ?? VARIANTS.unknown
  const severity = error.severity ?? variant.severityDefault

  const [isRetrying, setIsRetrying] = useState(false)
  const [isCopied, setIsCopied] = useState(false)
  const [troubleshootingOpen, setTroubleshootingOpen] = useState(false)
  const [countdown, setCountdown] = useState<number | null>(
    error.autoRetryIn != null && error.autoRetryIn > 0 ? error.autoRetryIn : null,
  )

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const copyTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const retryTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Countdown ticker
  useEffect(() => {
    if (countdown === null || countdown <= 0) return
    intervalRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev === null || prev <= 1) {
          if (intervalRef.current) clearInterval(intervalRef.current)
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Fire retry when countdown reaches zero
  useEffect(() => {
    if (countdown !== 0) return
    setCountdown(null)
    handleRetry()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [countdown])

  const cancelCountdown = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
    setCountdown(null)
  }, [])

  const handleRetry = useCallback(() => {
    if (isRetrying) return
    cancelCountdown()
    setIsRetrying(true)
    onRetry()
    retryTimeoutRef.current = setTimeout(() => setIsRetrying(false), 1800)
  }, [isRetrying, cancelCountdown, onRetry])

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(error.requestId).then(() => {
      setIsCopied(true)
      copyTimeoutRef.current = setTimeout(() => setIsCopied(false), 2000)
    })
  }, [error.requestId])

  useEffect(() => {
    return () => {
      if (copyTimeoutRef.current) clearTimeout(copyTimeoutRef.current)
      if (retryTimeoutRef.current) clearTimeout(retryTimeoutRef.current)
    }
  }, [])

  const { Icon } = variant
  const hasCountdown = countdown !== null && countdown > 0

  return (
    <section
      className={`ai-error-shell-base rounded-2xl border bg-gradient-to-br p-5 ${variant.borderClass} ${variant.shellGradient} ${className}`}
      role="alert"
      aria-live="polite"
    >
      {/* ── Header ── */}
      <div className="flex items-start gap-3">
        <div
          className={`h-10 w-10 rounded-xl flex items-center justify-center flex-shrink-0 ${variant.iconClass}`}
          aria-hidden="true"
        >
          <Icon size={18} />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-[11px] uppercase tracking-[0.18em] font-semibold text-slate-500 dark:text-slate-400">
              {variant.eyebrow}
            </p>
            <SeverityBadge severity={severity} />
          </div>
          <h3 className="mt-1 text-[15px] font-semibold text-slate-900 dark:text-slate-100 leading-snug">
            {error.title}
          </h3>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">{error.summary}</p>
        </div>

        {onDismiss && (
          <button
            type="button"
            onClick={onDismiss}
            className="flex-shrink-0 h-7 w-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-dark-700 transition-colors"
            aria-label="Dismiss error"
          >
            <X size={14} />
          </button>
        )}
      </div>

      {/* ── Meta badges ── */}
      <div className="mt-3 flex flex-wrap gap-2">
        <span
          className={`rounded-full border bg-white/85 dark:bg-dark-800/85 px-2.5 py-1 text-[11px] font-medium capitalize ${variant.badgeClass}`}
        >
          {error.code.replace('_', '\u202F')}
        </span>
        <button
          type="button"
          onClick={handleCopy}
          className={`rounded-full border bg-white/85 dark:bg-dark-800/85 px-2.5 py-1 text-[11px] font-medium inline-flex items-center gap-1.5 transition-colors ${variant.badgeClass} hover:opacity-75`}
          title="Copy request ID"
          aria-label={`Copy request ID ${error.requestId}`}
        >
          {isCopied ? <Check size={10} strokeWidth={3} /> : <Copy size={10} />}
          {isCopied ? 'Copied!' : `ID\u202F${error.requestId}`}
        </button>
      </div>

      {/* ── Source prompt ── */}
      {error.sourcePrompt && (
        <div className="mt-3 rounded-lg bg-white/60 dark:bg-dark-900/50 border border-slate-200 dark:border-dark-700 px-3 py-2">
          <p className="text-[10px] uppercase tracking-widest font-semibold text-slate-400 dark:text-slate-500 mb-0.5">
            Original prompt
          </p>
          <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed">
            {error.sourcePrompt}
          </p>
        </div>
      )}

      {/* ── Suggestions + Troubleshooting grid ── */}
      {(error.suggestions.length > 0 || error.troubleshooting.length > 0) && (
        <div className="mt-4 grid grid-cols-1 xl:grid-cols-2 gap-3">
          {/* Suggestions */}
          {error.suggestions.length > 0 && (
            <div className="rounded-xl border border-slate-200/90 dark:border-dark-700/90 bg-white/80 dark:bg-dark-800/80 p-3.5">
              <p className="mb-2.5 text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
                <LifeBuoy size={13} />
                Try one of these instead
              </p>
              <div className="flex flex-wrap gap-1.5">
                {error.suggestions.map((suggestion) => (
                  <button
                    key={suggestion}
                    type="button"
                    onClick={() => onUseSuggestion(suggestion)}
                    className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${variant.chipClass}`}
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Troubleshooting (collapsible) */}
          {error.troubleshooting.length > 0 && (
            <div className="rounded-xl border border-slate-200/90 dark:border-dark-700/90 bg-white/80 dark:bg-dark-800/80 overflow-hidden">
              <button
                type="button"
                className="w-full flex items-center justify-between px-3.5 py-3 text-left hover:bg-slate-50 dark:hover:bg-dark-700/40 transition-colors"
                onClick={() => setTroubleshootingOpen((prev) => !prev)}
                aria-expanded={troubleshootingOpen}
              >
                <span className="text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
                  <Wrench size={13} />
                  Troubleshooting steps
                </span>
                <ChevronDown
                  size={14}
                  className={`text-slate-400 transition-transform duration-200 ${troubleshootingOpen ? 'rotate-180' : ''}`}
                />
              </button>

              {troubleshootingOpen && (
                <div className="px-3.5 pb-3.5 border-t border-slate-100 dark:border-dark-700/60 pt-3">
                  <ol className="space-y-2">
                    {error.troubleshooting.map((step, i) => (
                      <li key={step} className="flex gap-2.5 text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                        <span className="flex-shrink-0 h-4 w-4 rounded-full bg-slate-100 dark:bg-dark-700 text-slate-500 dark:text-slate-400 flex items-center justify-center font-semibold text-[10px] mt-0.5">
                          {i + 1}
                        </span>
                        {step}
                      </li>
                    ))}
                  </ol>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ── Footer ── */}
      <div className="mt-4 flex items-center justify-between gap-3">
        {/* Countdown indicator */}
        <div className="text-xs text-slate-500 dark:text-slate-400 min-h-[24px] flex items-center">
          {hasCountdown ? (
            <span className="flex items-center gap-1.5">
              <CircularCountdown total={error.autoRetryIn!} remaining={countdown} />
              <span>
                Retrying in <strong>{countdown}s</strong>
              </span>
              <button
                type="button"
                onClick={cancelCountdown}
                className="ml-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 underline underline-offset-2 transition-colors"
              >
                cancel
              </button>
            </span>
          ) : null}
        </div>

        {/* Retry button */}
        <button
          type="button"
          onClick={handleRetry}
          disabled={isRetrying}
          className={`inline-flex items-center gap-2 rounded-lg text-white px-4 py-2 text-xs font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 disabled:opacity-60 disabled:cursor-not-allowed ${variant.retryClass}`}
        >
          {isRetrying ? <Loader2 size={13} className="animate-spin" /> : <RefreshCcw size={13} />}
          {isRetrying ? 'Retrying…' : (error.retryLabel ?? 'Retry request')}
        </button>
      </div>
    </section>
  )
}

export default AIErrorState
