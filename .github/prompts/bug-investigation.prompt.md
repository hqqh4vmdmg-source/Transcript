---
mode: agent
description: "Investigate a bug by tracing the issue through API routes, controllers, services, models, and database queries"
---

# Bug Investigation

Investigate and diagnose the reported bug in this Transcript Generator application.

## Investigation Steps

1. **Reproduce the issue** — Identify the exact endpoint, component, or workflow affected. Trace the user action from the client through the API to the database.

2. **Trace the request flow**:
   - Client service call (`client/src/services/`)
   - API route (`server/routes/`)
   - Controller (`server/controllers/`)
   - Service (`server/services/`)
   - Model (`server/models/`)
   - Database query and schema (`database/`)

3. **Check error handling** — Look for:
   - Missing `try/catch` blocks around async operations
   - Incorrect HTTP status codes (e.g., 500 instead of 503 for DB errors)
   - Swallowed errors that hide the root cause
   - Missing input validation

4. **Check data flow** — Verify:
   - Request body/params are correctly extracted
   - Service return values match what controllers expect
   - Database queries use correct column names and parameterized inputs
   - Response shapes match what the client expects

5. **Run relevant tests**:
   ```bash
   (cd server && npx jest tests/<relevant-suite>.test.js)
   (cd client && CI=true npx react-scripts test --watchAll=false --testPathPattern=<test-file>)
   ```

6. **Verify the fix** — After implementing a fix:
   - Run the full server test suite: `(cd server && npm test)`
   - Run the client build: `(cd client && CI=true npm run build)`
   - Run ESLint: `(cd server && npm run lint)`

## Common Bug Sources in This Codebase
- Mismatched API endpoint paths between client services and server routes
- Missing auth middleware on protected routes
- Database schema changes not reflected in model queries
- JSONB data shape mismatches in transcript `data` column
- Express 5 error handling differences from Express 4
