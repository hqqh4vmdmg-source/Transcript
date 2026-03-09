---
mode: agent
description: "Plan and execute a refactoring with safety checks and regression verification"
---

# Refactoring

Plan and execute a refactoring of the specified code area.

## Refactoring Process

1. **Assess current state** — Read and understand the code to be refactored:
   - What does it do?
   - What depends on it (callers, importers)?
   - What does it depend on (database, services, external APIs)?
   - What tests currently cover it?

2. **Define the refactoring goal**:
   - Readability improvement
   - Performance optimization
   - Code deduplication
   - Separation of concerns
   - API contract change (breaking or non-breaking)

3. **Pre-refactoring baseline**:
   ```bash
   cd server && npm run lint
   cd server && npm test
   cd client && CI=true npm test -- --watchAll=false
   cd client && CI=true npm run build
   ```
   Record pass/fail counts and any pre-existing failures.

4. **Make incremental changes** — Refactor in small, testable steps:
   - Extract functions/modules
   - Rename for clarity
   - Simplify control flow
   - Remove dead code
   - Consolidate duplicated logic

5. **Validate after each step**:
   ```bash
   cd server && npm run lint
   cd server && node -e "require('./app')"
   cd server && npm test
   ```

6. **Post-refactoring verification**:
   - All pre-existing tests still pass
   - No new ESLint errors
   - No new build warnings
   - Behavior is unchanged (same API contracts, same responses)

## Refactoring Rules for This Codebase

- **Maintain the layered architecture**: route → controller → service → model.
- **Do not change module system**: Server stays CommonJS, client stays ES modules.
- **Preserve API contracts**: Existing endpoint paths, methods, and response shapes must not change without versioning.
- **Update imports**: If moving or renaming files, update all `require()` or `import` references.
- **Keep tests passing**: If tests need updating due to refactoring, update them to test the same behavior.
- **Follow conventions**: `const` over `let`, `_` prefix for unused params, parameterized SQL.
