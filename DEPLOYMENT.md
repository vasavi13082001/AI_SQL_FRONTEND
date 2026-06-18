# Deployment Guide

## Docker

Build:

```bash
docker build -t ai-sql-frontend .
```

Build with custom API endpoint:

```bash
docker build -t ai-sql-frontend \
  --build-arg VITE_API_BASE_URL=https://api.example.com/api \
  --build-arg VITE_API_TIMEOUT_MS=20000 \
  --build-arg VITE_USE_MOCKS=false \
  .
```

Run:

```bash
docker run -p 8080:80 ai-sql-frontend
```

App URL: http://localhost:8080

## Nginx Behavior

- Static assets served from /usr/share/nginx/html
- SPA fallback enabled via try_files $uri /index.html
- Gzip enabled for web assets
- Long-cache headers for /assets files
