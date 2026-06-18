# AI-Powered SQL Query Generator Frontend

Production-ready React + TypeScript frontend for AI-assisted SQL generation, validation, execution, analytics monitoring, and role-based access control.

## Tech Stack

- React 18 + TypeScript
- Vite + Tailwind CSS
- React Router v6
- Axios (centralized API client + interceptors)
- Recharts
- react-window (virtualized result table)
- react-hot-toast

## Implemented Features

### 1) API Integration

- Centralized Axios client in src/api/client.ts
- JWT request interceptor (Authorization header)
- Global response error normalization in src/api/errors.ts
- Unauthorized event handling for session logout
- Reusable service modules:
  - src/services/authService.ts
  - src/services/sqlService.ts
  - src/services/analyticsService.ts
- TypeScript API contracts in src/types/api.ts
- Reusable API hooks:
  - src/hooks/useApiRequest.ts
  - src/hooks/useDashboardData.ts
  - src/hooks/useActivityMonitoring.ts
  - src/hooks/usePolling.ts
- Graceful mock fallback support using VITE_USE_MOCKS

### 2) Activity Monitoring Dashboard

- Route: /app/activity-monitor
- API health status cards
- SQL generation metrics chart
- Failed prompt metrics pie chart
- Query execution timeline
- User activity tracking table
- KPI summary cards
- Auto refresh polling (15s)

### 3) End-to-End AI SQL Flow

- AI prompt to SQL generation in QueryWorkbench
- Server-side SQL validation prior to execution
- SQL execution with latency + request id output
- Virtualized result rendering for large row sets
- Toast notifications for success/warning/failure
- Query history dashboard connected via API service

### 4) Performance Optimizations

- Route-level lazy loading with React.lazy + Suspense
- Dynamic code splitting for large route components
- Memoized reusable components (ApiStatusCards, QueryExecutionTimeline, VirtualizedTable)
- Existing useMemo/useCallback patterns retained and extended
- Virtualized table rendering via react-window
- Skeleton loaders for async states

### 5) UI/UX Improvements

- Global ErrorBoundary for resilient UI recovery
- Global toast provider
- Responsive monitoring + workbench layouts
- Improved loading and empty/error states
- Accessibility labels for key interactions
- Shared visual tokens in src/index.css

### 6) Docker Deployment

- Multi-stage Docker build in Dockerfile
- Vite production build in builder stage
- Nginx runtime stage
- SPA route fallback via nginx.conf
- Environment-driven API config with build args

## Setup Instructions

### Prerequisites

- Node.js 18+
- npm 9+

### Install and Run

1. Install dependencies:

```bash
npm install
```

2. Configure environment:

```bash
cp .env.example .env
```

3. Start dev server:

```bash
npm run dev
```

4. Build production bundle:

```bash
npm run build
```

5. Preview production build:

```bash
npm run preview
```

## Environment Variables

Use .env (see .env.example):

- VITE_API_BASE_URL: Backend API base URL
- VITE_API_TIMEOUT_MS: Request timeout in milliseconds
- VITE_USE_MOCKS: true/false fallback behavior when API is unavailable

## Folder Structure

Key architecture paths:

- src/api
  - client.ts
  - errors.ts
  - mockData.ts
  - utils.ts
- src/services
  - authService.ts
  - sqlService.ts
  - analyticsService.ts
- src/hooks
  - useApiRequest.ts
  - useDashboardData.ts
  - useActivityMonitoring.ts
  - usePolling.ts
- src/components
  - Dashboard.tsx
  - QueryWorkbench.tsx
  - ActivityMonitoringDashboard.tsx
  - VirtualizedTable.tsx
  - ErrorBoundary.tsx
  - ToastProvider.tsx

## Authentication and Routing

- Auth provider restores persisted JWT session from localStorage
- Protected route enforcement by role (admin/analyst/viewer)
- Unauthorized API responses trigger auth:unauthorized and logout

## Deployment Guide (Docker)

Build image:

```bash
docker build -t ai-sql-frontend .
```

Build with API overrides:

```bash
docker build -t ai-sql-frontend \
  --build-arg VITE_API_BASE_URL=https://api.example.com \
  --build-arg VITE_API_TIMEOUT_MS=20000 \
  --build-arg VITE_USE_MOCKS=false \
  .
```

Run container:

```bash
docker run -p 8080:80 ai-sql-frontend
```

Open: http://localhost:8080

## API Integration Guide

The frontend expects these backend endpoints:

- POST /auth/login
- POST /auth/register
- GET /auth/me
- POST /sql/generate
- POST /sql/validate
- POST /sql/execute
- GET /analytics/dashboard
- GET /analytics/query-history
- GET /analytics/activity-monitor

All authenticated endpoints should accept:

- Authorization: Bearer <jwt>

## Demo Workflow

1. Sign in using any role from login page.
2. Open Dashboard and use AI SQL Workbench.
3. Enter prompt, generate SQL, execute query.
4. Inspect virtualized result table and query metadata.
5. Open Activity Monitor to observe API health and AI metrics.
6. Verify role-based routes in sidebar.

## Notes

- The UI stays functional with mock fallback when backend is unavailable (configurable).
- For strict production behavior, set VITE_USE_MOCKS=false.
