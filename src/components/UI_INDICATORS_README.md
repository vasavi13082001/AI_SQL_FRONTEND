# UI Indicators - Cache, Loading Skeletons & Refresh States

Comprehensive UI components and hooks for displaying cached responses, loading states, and dashboard refresh operations in your React application.

## Overview

This module provides a complete set of components and hooks for managing data cache visualization, loading states, and refresh operations with automatic optimization.

### Components

- **CacheIndicator** - Visual indicator for cached data with metadata
- **CacheBadge** - Compact badge for cache status
- **LoadingSkeleton** - Reusable skeleton loaders for various UI elements
- **DashboardRefreshState** - Visual refresh state indicator with controls
- **RefreshStatusBadge** - Minimal refresh status indicator
- **RefreshTimeline** - Shows refresh history

### Hooks

- **useCache** - Manage data caching with automatic expiry and persistence
- **useOptimizedCache** - Higher-level cache with retry logic and deduplication
- **useDashboardRefresh** - Manage dashboard refresh states with auto-refresh
- **useMultipleRefresh** - Coordinate refresh across multiple dashboard sections

## Installation

All components and hooks are already integrated into the project.

## Quick Start

### Using Cache Indicators

```tsx
import { CacheIndicator, CacheBadge } from '@/components'

// Detailed cache indicator
<CacheIndicator
  metadata={{
    isCached: true,
    cacheAge: 45000,           // milliseconds
    cacheSource: 'optimized',
    hitRate: 82,                // 0-100
    size: 125440,               // bytes
    ttl: 280000,                // time to live in ms
  }}
  showAge
  showHitRate
/>

// Compact badge
<CacheBadge metadata={{ isCached: true }} size="sm" />
```

### Using Loading Skeletons

```tsx
import { LoadingSkeleton, SkeletonGrid } from '@/components'

// Various skeleton types
<LoadingSkeleton type="chart" height="h-64" />
<LoadingSkeleton type="table" count={5} />
<LoadingSkeleton type="card" count={3} />
<LoadingSkeleton type="list" count={4} />

// Grid of skeletons
<SkeletonGrid count={6} columns={3} />

// Individual line skeletons
<SkeletonLine width="w-3/4" />
<SkeletonParagraph lines={3} />
```

### Using Refresh State

```tsx
import { DashboardRefreshState, useDashboardRefresh } from '@/components'

const MyDashboard = () => {
  const { refreshState, refresh, autoRefreshEnabled, setAutoRefresh } = 
    useDashboardRefresh(
      async () => {
        const data = await fetchData()
        return { itemsUpdated: data.length, timestamp: new Date(), source: 'manual' }
      },
      {
        autoRefreshInterval: 5 * 60 * 1000, // 5 minutes
        enableOptimization: true
      }
    )

  return (
    <div>
      <DashboardRefreshState
        metadata={refreshState}
        onRefresh={() => refresh('manual')}
        showDetails
      />
      
      <button onClick={() => setAutoRefresh(!autoRefreshEnabled)}>
        {autoRefreshEnabled ? 'Disable' : 'Enable'} Auto-Refresh
      </button>
    </div>
  )
}
```

### Using Cache Hook

```tsx
import { useCache, useOptimizedCache } from '@/components'

// Basic cache management
const MyComponent = () => {
  const {
    data,
    getCached,
    setCached,
    invalidate,
    cacheMetadata,
    getStats
  } = useCache({
    ttl: 5 * 60 * 1000, // 5 minutes
    storageKey: 'my-cache'
  })

  const handleDataFetch = async () => {
    // Check cache first
    const cached = getCached('my-data')
    if (cached) {
      setData(cached)
      return
    }

    // Fetch from server
    const data = await fetchData()
    setCached('my-data', data, 'remote')
  }

  return (
    <div>
      <CacheIndicator metadata={cacheMetadata} />
      <button onClick={() => invalidate('my-data')}>Clear Cache</button>
    </div>
  )
}

// Optimized cache with auto-retry
const MyOptimizedComponent = () => {
  const { data, isLoading, error, optimizationLevel, fetch } = 
    useOptimizedCache(
      async () => {
        const response = await fetch('/api/data')
        return response.json()
      },
      'my-optimized-key',
      {
        ttl: 5 * 60 * 1000,
        retries: 3,
        retryDelay: 1000
      }
    )

  return (
    <div>
      {isLoading && <LoadingSkeleton type="chart" />}
      {error && <p>Error: {error.message}</p>}
      {data && (
        <div>
          <p>Optimization Level: {optimizationLevel}</p>
          <button onClick={() => fetch(true)}>Refresh (skip cache)</button>
        </div>
      )}
    </div>
  )
}
```

### Using Multiple Refresh

```tsx
import { useMultipleRefresh } from '@/components'

const Dashboard = () => {
  const { sectionStates, refreshAll, refreshSection, getOverallState } = 
    useMultipleRefresh({
      users: async () => {
        const data = await fetchUsers()
        return { itemsUpdated: data.length, timestamp: new Date(), source: 'auto' }
      },
      metrics: async () => {
        const data = await fetchMetrics()
        return { itemsUpdated: 1, timestamp: new Date(), source: 'auto' }
      },
      analytics: async () => {
        const data = await fetchAnalytics()
        return { itemsUpdated: data.length, timestamp: new Date(), source: 'auto' }
      }
    })

  return (
    <div>
      <button onClick={refreshAll}>Refresh All</button>
      {Object.entries(sectionStates).map(([section, state]) => (
        <div key={section}>
          <RefreshStatusBadge metadata={state} />
          <button onClick={() => refreshSection(section)}>
            Refresh {section}
          </button>
        </div>
      ))}
    </div>
  )
}
```

## Component Props

### CacheIndicator

```typescript
interface CacheIndicatorProps {
  metadata: CacheMetadata
  showAge?: boolean              // Show cache age
  showHitRate?: boolean          // Show cache hit rate
  compact?: boolean              // Compact version
  className?: string
}

interface CacheMetadata {
  isCached: boolean
  cacheAge?: number              // milliseconds
  cacheSource?: 'local' | 'session' | 'remote' | 'optimized'
  hitRate?: number               // 0-100
  size?: number                  // bytes
  ttl?: number                   // milliseconds
}
```

### LoadingSkeleton

```typescript
interface LoadingSkeletonProps {
  type: 'card' | 'chart' | 'table' | 'text' | 'avatar' | 'button' | 'input' | 'list' | 'metric'
  count?: number                 // Number of items to render
  height?: string                // Tailwind height class
  width?: string                 // Tailwind width class
  className?: string
  animated?: boolean             // Enable pulse animation
}
```

### DashboardRefreshState

```typescript
interface DashboardRefreshStateProps {
  metadata: DashboardRefreshMetadata
  onRefresh?: () => void
  onCancel?: () => void
  showDetails?: boolean
  compact?: boolean
  className?: string
}

interface DashboardRefreshMetadata {
  state: 'idle' | 'loading' | 'success' | 'error' | 'optimizing'
  trigger?: 'manual' | 'auto' | 'scheduled' | 'optimized'
  lastRefreshed?: Date
  nextRefresh?: Date
  itemsUpdated?: number
  error?: string
  progress?: number              // 0-100
  optimizationLevel?: 'low' | 'medium' | 'high'
}
```

## Hook Options

### useCache

```typescript
interface UseCacheOptions {
  ttl?: number                   // Default TTL in milliseconds
  storageKey?: string            // localStorage key
  enableRemoteSync?: boolean     // Sync with remote
}
```

### useDashboardRefresh

```typescript
interface UseDashboardRefreshOptions {
  autoRefreshInterval?: number   // milliseconds
  refreshTimeout?: number        // milliseconds
  enableOptimization?: boolean
  optimizationThreshold?: number // items count
}
```

## Features

### Cache Indicators
- ✅ Visual status indicators (live, cached, optimized)
- ✅ Cache age formatting (e.g., "5m ago", "2h ago")
- ✅ Hit rate percentage display
- ✅ Size estimation in human-readable format
- ✅ TTL countdown
- ✅ Multiple cache sources (local, session, remote, optimized)
- ✅ Compact and detailed variants

### Loading Skeletons
- ✅ 9+ skeleton types (card, chart, table, text, avatar, etc.)
- ✅ Customizable height, width, and count
- ✅ Pulse animation
- ✅ Responsive grid layouts
- ✅ Dark mode support
- ✅ Line and paragraph shortcuts

### Refresh States
- ✅ 5 refresh states (idle, loading, success, error, optimizing)
- ✅ Progress indicators
- ✅ Trigger badges (manual, auto, scheduled, optimized)
- ✅ Performance metrics tracking
- ✅ Refresh history timeline
- ✅ Auto-refresh with configurable intervals
- ✅ Retry logic with exponential backoff
- ✅ Multi-section coordination

### Caching
- ✅ localStorage persistence
- ✅ Automatic expiry (TTL)
- ✅ Hit rate tracking
- ✅ Cache statistics
- ✅ Multiple storage sources
- ✅ Request deduplication
- ✅ Automatic cleanup

## Performance Optimization

### Cache Optimization Levels
- **Low**: < 50% cache hit rate
- **Medium**: 50-80% cache hit rate
- **High**: > 80% cache hit rate

### Automatic Features
- Periodic cache cleanup (every 60 seconds)
- Exponential backoff on retry failures
- Request deduplication
- Progress tracking during refresh
- Automatic timeout handling

## Best Practices

1. **Set appropriate TTLs** - Balance between freshness and performance
2. **Monitor hit rates** - Adjust cache strategy based on metrics
3. **Use skeletons during loading** - Improve perceived performance
4. **Enable auto-refresh judiciously** - Consider API limits and resource usage
5. **Coordinate multi-section refreshes** - Avoid thundering herd
6. **Show cache badges in tables** - Help users understand data freshness
7. **Track optimization levels** - Adjust refresh strategies accordingly

## Integration Examples

### In Admin Analytics Dashboard

```tsx
import { CacheIndicator, DashboardRefreshState, useDashboardRefresh } from '@/components'

export const AdminAnalyticsDashboard = () => {
  const { refreshState, refresh } = useDashboardRefresh(
    async () => {
      const data = await fetchAnalytics()
      return { 
        itemsUpdated: data.sections.length,
        timestamp: new Date(),
        source: 'auto'
      }
    },
    { autoRefreshInterval: 30000 }
  )

  return (
    <div>
      <DashboardRefreshState 
        metadata={refreshState}
        onRefresh={() => refresh('manual')}
      />
      
      {/* Cache indicator for each section */}
      {data.sections.map(section => (
        <div key={section.id}>
          <CacheIndicator 
            metadata={{
              isCached: true,
              cacheAge: section.age,
              cacheSource: 'optimized',
              hitRate: section.hitRate
            }}
          />
        </div>
      ))}
    </div>
  )
}
```

### In Data Table with Inline Loading

```tsx
import { CacheBadge, LoadingSkeleton } from '@/components'

export const DataTableWithIndicators = ({ data, isLoading }) => {
  if (isLoading) {
    return <LoadingSkeleton type="table" count={10} />
  }

  return (
    <table>
      <thead>
        <tr>
          <th>Name</th>
          <th>Status</th>
          <th>Cache</th>
        </tr>
      </thead>
      <tbody>
        {data.map(row => (
          <tr key={row.id}>
            <td>{row.name}</td>
            <td>{row.status}</td>
            <td>
              <CacheBadge 
                metadata={{
                  isCached: row.isCached,
                  cacheSource: 'local'
                }}
              />
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
```

## Files Overview

### Components
- `CacheIndicator.tsx` - Cache status and metadata display
- `LoadingSkeleton.tsx` - Loading state skeletons
- `DashboardRefreshState.tsx` - Refresh state management display
- `UIIndicatorsDemoPage.tsx` - Complete demo and examples

### Utilities
- `useCache.ts` - Cache management hooks
- `useDashboardRefresh.ts` - Refresh state management hooks

### Index
- `index.ts` - Central export point for all components and hooks

## Styling

All components use Tailwind CSS and automatically adapt to dark mode through the `useDarkMode` context.

### Custom Styling

All components accept a `className` prop for additional styling:

```tsx
<CacheIndicator 
  metadata={...}
  className="border-2 border-blue-500"
/>

<DashboardRefreshState 
  metadata={...}
  className="shadow-lg"
/>
```

## Troubleshooting

### Cache not persisting
- Check localStorage is enabled
- Verify `storageKey` doesn't conflict with other storage
- Check browser storage quota

### Skeletons not animating
- Ensure Tailwind CSS animations are enabled
- Check `animated` prop is not set to `false`

### Refresh timeout
- Increase `refreshTimeout` option
- Check network connectivity
- Verify API endpoint availability

### Hit rates too low
- Increase `ttl` value
- Review cache invalidation logic
- Monitor cache hit patterns

## Contributing

When extending these components:

1. Maintain dark mode compatibility
2. Use TypeScript for type safety
3. Add JSDoc comments for public APIs
4. Test with various data sizes
5. Update this documentation

## License

Part of the AI SQL Frontend project.
