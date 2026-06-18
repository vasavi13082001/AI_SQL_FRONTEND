# API Integration Guide

## Client Architecture

- Axios instance: src/api/client.ts
- Error normalization: src/api/errors.ts
- Mock fallback controls: src/api/utils.ts and src/api/mockData.ts

## Auth

- POST /auth/login
- POST /auth/register
- GET /auth/me

Response shape:

```json
{
  "token": "jwt",
  "user": {
    "id": "uuid",
    "name": "Jane",
    "email": "jane@example.com",
    "role": "admin"
  }
}
```

## SQL

- POST /sql/generate
- POST /sql/validate
- POST /sql/execute

## Analytics

- GET /analytics/dashboard
- GET /analytics/query-history
- GET /analytics/activity-monitor

## Headers

Authenticated requests use:

- Authorization: Bearer <jwt>
- Content-Type: application/json

## Hook Usage

- useApiRequest: generic async request state
- useDashboardData: dashboard analytics fetch + optional polling
- useActivityMonitoring: monitoring data fetch + polling

## Fallback Mode

If VITE_USE_MOCKS=true, service modules fallback to local mock responses on network/server errors.
