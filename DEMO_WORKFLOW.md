# Demo Workflow

1. Start app with npm run dev.
2. Log in from /login using any demo role.
3. Open Dashboard.
4. Use AI SQL Workbench:
   - Enter natural language prompt
   - Generate SQL
   - Execute query
   - Review virtualized result table
5. Open Activity Monitor:
   - Verify API health cards
   - Verify AI success/failure metrics
   - Verify failed prompt chart and user activity table
6. Test role routing:
   - admin: admin analytics routes available
   - analyst/viewer: restricted routes blocked
7. Disable mock fallback in .env and verify real backend behavior.
