---
mode: agent
description: "Create a detailed implementation plan for a new feature or change with file-level breakdown"
---

# Implementation Plan

Create a detailed implementation plan for the requested change.

## Planning Process

1. **Scope the change** — Identify which layers are affected:
   - [ ] Database schema (`database/`)
   - [ ] Server models (`server/models/`)
   - [ ] Server services (`server/services/`)
   - [ ] Server controllers (`server/controllers/`)
   - [ ] Server routes (`server/routes/`)
   - [ ] Server middleware (`server/middleware/`)
   - [ ] Client services (`client/src/services/`)
   - [ ] Client components (`client/src/components/`)
   - [ ] Client pages (`client/src/pages/`)
   - [ ] Tests (`server/tests/`, `client/src/__tests__/`)
   - [ ] Documentation (`API.md`, `README.md`, etc.)
   - [ ] Infrastructure (`Dockerfile`, `docker-compose.yml`, CI workflows)

2. **Map dependencies** — For each affected file, list:
   - What it imports/requires
   - What imports/requires it
   - What database tables it touches
   - What API endpoints it exposes or consumes

3. **Define the implementation order**:
   - Schema changes first (if any)
   - Model layer (new queries)
   - Service layer (business logic)
   - Controller layer (request handling)
   - Route definitions (with validation and middleware)
   - Client service methods
   - Client UI components
   - Tests for each layer
   - Documentation updates

4. **Identify risks and edge cases**:
   - Backward compatibility with existing API consumers
   - Database migration requirements
   - Impact on existing tests
   - Security implications (auth, input validation, SQL injection)
   - Performance considerations (N+1 queries, large payloads)

5. **Define validation steps**:
   ```bash
   cd server && npm run lint
   cd server && node -e "require('./app')"
   cd server && npm test
   cd client && CI=true npm run build
   cd client && CI=true npm test -- --watchAll=false
   ```

## Output Format
Produce a numbered task list with:
- File path and description of change
- Dependencies on other tasks
- Estimated complexity (small/medium/large)
- Associated test file(s) to create or update
