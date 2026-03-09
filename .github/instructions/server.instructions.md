---
applyTo: "server/**"
---

# Server Instructions

## Overview
The `server/` directory contains the Node.js/Express 5 REST API backend. All code uses **CommonJS** (`require`/`module.exports`).

## Directory Layout
```
server/
├── app.js                  # Express app setup, middleware, route mounting
├── server.js               # Entry point (dotenv, listen, graceful shutdown)
├── config/database.js      # PostgreSQL pool configuration
├── controllers/            # Route handler functions (6 files)
├── middleware/              # Express middleware (authMiddleware.js)
├── models/                 # Database query layer (5 files)
├── routes/                 # API route definitions (7 files)
├── services/               # Business logic (22 files)
├── templates/              # EJS templates for PDF generation
├── tests/                  # Jest + Supertest tests
├── utils/                  # Utility helpers (seal/logo generators, validators)
├── public/seals/           # Generated seal images (gitignored)
├── eslint.config.js        # ESLint flat config
├── jest.config.js          # Jest configuration
└── .env.example            # Environment variable template
```

## Request Flow Pattern
All new API endpoints must follow the established layered pattern:
1. **Route** (`routes/*.js`) — defines HTTP method, path, validation, and middleware
2. **Controller** (`controllers/*.js`) — handles request/response, calls services
3. **Service** (`services/*.js`) — implements business logic, calls models
4. **Model** (`models/*.js`) — executes parameterized SQL queries via `db.query()`

Exception: The `academicRoutes.js` file has inline handlers that call services directly (64 routes). New academic routes should follow this existing pattern.

## Coding Rules
- Use `const` for all variables that are not reassigned; use `let` only when reassignment is needed. Never use `var`.
- Prefix unused function parameters with `_` (e.g., `_req`, `_next`, `_error`).
- Use `require()` and `module.exports` — no ES module `import`/`export` syntax.
- `console.log`, `console.error`, `console.warn` are acceptable (ESLint `no-console` is off).
- Use `prefer-const` consistently — ESLint enforces this as an error.

## Database Access
- Import the database module: `const db = require('../config/database');`
- Always use parameterized queries: `db.query('SELECT * FROM users WHERE id = $1', [userId])`
- Never concatenate or interpolate user input into SQL strings.
- Handle `ECONNREFUSED` errors by returning HTTP 503 (service unavailable), not 500.
- The pool error handler in `config/database.js` must **not** call `process.exit()`.

## Authentication
- JWT tokens are verified in `middleware/authMiddleware.js`.
- Protected routes must include `authMiddleware` in their middleware chain.
- `req.user` is populated by the auth middleware with the decoded JWT payload.
- `JWT_SECRET` must come from `process.env` — never hard-coded.

## Error Handling
- Use Express error middleware pattern: `(err, req, res, _next) => { ... }`.
- In development mode, include stack traces in error responses; in production, omit them.
- Return appropriate HTTP status codes: 400 for validation, 401 for auth, 403 for forbidden, 404 for not found, 503 for DB unavailable, 500 for unexpected errors.

## Validation
- Use `express-validator` for request validation in route files.
- Validate all user-supplied input before passing to services or models.

## Testing
- Tests are in `server/tests/` using Jest + Supertest.
- Test files must match `**/tests/**/*.test.js` pattern.
- Tests require a running PostgreSQL instance with schema loaded.
- Run tests: `cd server && npm test`
- Run specific test: `cd server && npx jest tests/auth.test.js`

## Validation Before Push
```bash
cd server && npm run lint          # ESLint must pass
cd server && node -e "require('./app')"  # Smoke-check require tree
cd server && npm test              # If PostgreSQL is available
```

## Dependencies
- Express 5 (note: Express 5 has different error handling than Express 4)
- `pg` for PostgreSQL — use the pool from `config/database.js`
- `bcrypt` for password hashing
- `jsonwebtoken` for JWT
- `puppeteer` for PDF generation (skip download in sandboxed envs)
- `express-validator` for input validation
- `multer` for file uploads
- `nodemailer` for email
- `ejs` for PDF templates
- `winston` for structured logging
- `qrcode` for QR code generation
- `xlsx` and `csv-parse` for data import/export
- `jszip` for ZIP file creation

## Anti-Patterns
- Do not use `async/await` without proper `try/catch` error handling.
- Do not return raw database errors to the client in production.
- Do not add `process.exit()` in services, controllers, or middleware.
- Do not bypass the auth middleware for protected routes.
- Do not use string concatenation in SQL queries.
- Do not add new middleware to `app.js` without considering order (security headers → CORS → body parsing → logging → routes → error handler).
