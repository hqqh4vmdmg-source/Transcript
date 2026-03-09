---
mode: agent
description: "Generate tests for server endpoints (Jest + Supertest) or client components (React Testing Library)"
---

# Test Generation

Generate tests for the specified code area.

## Server Test Template (Jest + Supertest)

When generating tests for server endpoints:

```javascript
const request = require('supertest');
const app = require('../app');
const db = require('../config/database');

describe('<Endpoint Group>', () => {
  let authToken;

  beforeAll(async () => {
    // Set up test data, create test user, get auth token if needed
  });

  afterAll(async () => {
    // Clean up test data
    await db.pool.end();
  });

  describe('GET /api/<resource>', () => {
    test('should return 200 with valid data', async () => {
      const res = await request(app)
        .get('/api/<resource>')
        .set('Authorization', `Bearer ${authToken}`);
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('<expected-field>');
    });

    test('should return 401 without auth token', async () => {
      const res = await request(app).get('/api/<resource>');
      expect(res.status).toBe(401);
    });
  });
});
```

## Client Test Template (React Testing Library)

When generating tests for client components:

```javascript
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import ComponentName from '../components/ComponentName';

// Mock service dependencies
jest.mock('../services/serviceName', () => ({
  methodName: jest.fn(),
}));

describe('ComponentName', () => {
  test('renders without crashing', () => {
    render(
      <BrowserRouter>
        <ComponentName />
      </BrowserRouter>
    );
    expect(screen.getByText('Expected Text')).toBeInTheDocument();
  });
});
```

## Test Generation Guidelines

1. **Cover all HTTP status codes** — Test 200, 201, 400, 401, 403, 404, 500/503 paths.
2. **Test input validation** — Invalid, missing, and edge-case inputs.
3. **Test auth requirements** — Requests with and without valid tokens.
4. **Mock external services** — Database, email, PDF generation in unit tests.
5. **Use descriptive names** — `should return 404 when transcript does not exist`.
6. **Clean up after tests** — Remove test data in `afterAll`/`afterEach`.

## Running Tests
```bash
# Server tests (requires PostgreSQL)
cd server && npm test
cd server && npx jest tests/<specific-file>.test.js --verbose

# Client tests
cd client && CI=true npm test -- --watchAll=false
cd client && CI=true npx react-scripts test --testPathPattern=<test-file> --watchAll=false
```
