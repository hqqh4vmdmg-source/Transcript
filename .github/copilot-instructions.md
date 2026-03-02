# Copilot Instructions

## Repository Overview
Monorepo (npm workspaces) with three packages:
- **root** – orchestration scripts and dev tooling
- **`server/`** – Node.js/Express REST API (CommonJS, port 5000)
- **`client/`** – React 18 CRA frontend (port 3000, proxied to server)

## Project Setup
```bash
# Install all dependencies (avoids puppeteer download errors in sandboxed envs)
cd server && PUPPETEER_SKIP_DOWNLOAD=true npm install
cd ../client && npm install
```

Copy `server/.env.example` to `server/.env` and fill in values before starting the server.

## Running the App
```bash
# Start both server and client (from repo root)
npm run dev

# Server only
cd server && npm run dev   # nodemon, port 5000

# Client only
cd client && npm start     # CRA dev server, port 3000
```

## Lint, Test, Build
```bash
# Server ESLint (flat config eslint.config.js)
cd server && node_modules/.bin/eslint .

# Server tests (Jest + Supertest, requires PostgreSQL)
cd server && npm test

# Client tests (React Testing Library)
cd client && CI=true npm test -- --watchAll=false

# Client production build (should produce zero warnings)
cd client && CI=true npm run build

# Quick server smoke-check (no DB needed)
cd server && node -e "require('./app')"
```

## Architecture
- **API routes** mounted in `server/app.js`:
  - `/api/auth` → `routes/authRoutes.js`
  - `/api/transcripts` → `routes/transcriptRoutes.js`
  - `/api/seals` → `routes/sealRoutes.js`
  - `/api/generator` → `routes/generatorRoutes.js`
  - `/api/certificates` → `routes/certificateRoutes.js`
  - `/api/design` → `routes/designSystemRoutes.js`
  - `/api/academic` → `routes/academicRoutes.js`
- **Database**: PostgreSQL via `pg`. Pool config in `server/config/database.js`. Schema: `database/schema.sql`.
- **Auth**: JWT (`jsonwebtoken`). Secrets from env vars only — never hard-code.
- **Client services**: `client/src/services/` — axios wrappers that hit the Express API.
- **Academic/automation features**: 200 features implemented across 10 service files in `server/services/` and exposed through `/api/academic`.

## ESLint Rules to Observe (server)
- `prefer-const` and `no-var` are errors — always use `const`/`let`.
- `no-unused-vars` is an error; prefix intentionally-unused args/caught errors with `_`.
- `no-console` is off — `console.log` is acceptable in server code.

## CI Pipeline (`.github/workflows/ci.yml`)
Four jobs run on push/PR:
1. **lint-and-format** – ESLint on server and client (continue-on-error, non-blocking).
2. **test-backend** – spins up a PostgreSQL 15 service, runs `cd server && npm test`.
3. **test-frontend** – runs `cd client && CI=true npm test -- --coverage --watchAll=false`.
4. **build** – `cd client && npm run build` (requires tests to pass first).

To avoid breaking CI:
- Run the server smoke-check and ESLint before pushing server changes.
- Run `CI=true npm run build` in `client/` before pushing client changes.
- Never commit secrets or credentials.

## Key Conventions
- All server files use **CommonJS** (`require`/`module.exports`).
- PostgreSQL connection errors surface as `AggregateError` with `.code === 'ECONNREFUSED'`; return 503, not 500 (see `server/controllers/authController.js`).
- The DB pool error handler in `server/config/database.js` must **not** call `process.exit()`.
- Feature flags and toggles live in `server/services/generationTogglesService.js`.
- Static seal images are served from `server/public/seals/` via `/seals` route.
- Client proxy (`"proxy": "http://localhost:5000"`) in `client/package.json` forwards all unknown requests to the server during development.
