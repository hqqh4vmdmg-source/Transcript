---
applyTo: "server/tests/**,client/src/__tests__/**,tests/**"
---

# Test Instructions

## Overview
The repository has three test layers:

| Layer | Location | Framework | Runner |
|---|---|---|---|
| Server unit/integration | `server/tests/*.test.js` | Jest + Supertest | `cd server && npm test` |
| Client unit | `client/src/__tests__/*.test.js` | Jest + React Testing Library | `cd client && CI=true npm test -- --watchAll=false` |
| E2E | `tests/e2e/*.spec.js` | Playwright | `npm run test:e2e` |

## Server Tests

### Structure
- 5 test suites in `server/tests/`: `auth.test.js`, `transcript.test.js`, `seal.test.js`, `generator.test.js`, `api.test.js`
- 2 manual test files: `manual-seal-test.js`, `manual-category-test.js`
- Total: ~64 automated tests

### Requirements
- **PostgreSQL must be running** with both `schema.sql` and `seal_schema.sql` loaded.
- Without a database, 44+ tests will fail with `ECONNREFUSED`.
- Environment variables needed: `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`, `JWT_SECRET`.

### Running
```bash
cd server && npm test                        # All tests with coverage
cd server && npx jest tests/auth.test.js     # Single suite
cd server && npm run test:watch              # Watch mode
cd server && npm run test:ci                 # CI mode (coverage, 2 workers)
```

### Writing Server Tests
- Import the Express app: `const app = require('../app');`
- Use Supertest: `const request = require('supertest');`
- Test HTTP endpoints: `const res = await request(app).get('/api/health');`
- Assert status codes and response body shapes.
- For authenticated endpoints, create a test user and obtain a JWT token in `beforeAll`.
- Clean up test data in `afterAll` to avoid test pollution.

### Jest Config
- Test environment: `node`
- Test match: `**/tests/**/*.test.js`
- Coverage collected from all `.js` files except `node_modules`, `tests`, and `coverage`.

## Client Tests

### Structure
- Test files in `client/src/__tests__/` (e.g., `GPACalculator.test.js`).
- Uses CRA's built-in Jest + React Testing Library setup.

### Running
```bash
cd client && CI=true npm test -- --watchAll=false          # All tests
cd client && CI=true npm test -- --coverage --watchAll=false  # With coverage
```

### Writing Client Tests
- Use React Testing Library patterns: `render`, `screen`, `fireEvent`, `waitFor`.
- Test components in isolation by mocking service calls.
- Use `jest.mock()` to mock `../services/authService` and similar modules.
- Test user interactions, not implementation details.

## E2E Tests

### Structure
- Playwright tests in `tests/e2e/` (e.g., `basic.spec.js`).
- Config in `playwright.config.js` at repo root.

### Running
```bash
npm run test:e2e                    # Run all E2E tests
npx playwright test --project=chromium  # Single browser
```

### Requirements
- Both server and client must be running (`npm run dev`).
- Playwright auto-starts the dev server via `webServer` config.

## General Testing Rules
- New features must include corresponding tests.
- Do not remove or weaken existing tests to make new code pass.
- Test both success and error paths.
- Use descriptive test names that explain the expected behavior.
- Keep tests independent — no ordering dependencies between test cases.
- Mock external services (email, PDF generation) in unit tests.
