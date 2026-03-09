# Copilot Instructions

## Repository Overview

Monorepo (npm workspaces) for a Transcript Generator web application — creates, manages, and exports academic transcripts, certificates, and diplomas with PDF generation and seal/watermark support.

Three workspace packages:
- **root** – orchestration scripts, dev tooling, Prettier/Husky/lint-staged config
- **`server/`** – Node.js/Express 5 REST API (CommonJS, port 5000)
- **`client/`** – React 19 CRA frontend (port 3000, proxied to server)

Supporting directories:
- **`database/`** – 10 PostgreSQL schema files (init order matters)
- **`scripts/`** – Bash utilities (backup, health-check, migrate)
- **`tests/`** – Playwright E2E tests

## Project Setup

```bash
# Install all dependencies (skip Puppeteer download in sandboxed/CI envs)
cd server && PUPPETEER_SKIP_DOWNLOAD=true npm install
cd ../client && npm install

# Copy environment template and fill in values before starting
cp server/.env.example server/.env
```

Required env vars for server: `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`, `JWT_SECRET`, `CLIENT_URL`. See `server/.env.example` for the full list including optional SMTP config.

## Running the App

```bash
# Start both server and client (from repo root)
npm run dev

# Server only (nodemon, port 5000)
cd server && npm run dev

# Client only (CRA dev server, port 3000)
cd client && npm start
```

## Validation Commands

Always validate changes before pushing. Run these from the repo root:

```bash
# Server ESLint (flat config in server/eslint.config.js)
cd server && npm run lint

# Server tests (Jest + Supertest — requires PostgreSQL running)
cd server && npm test

# Quick server smoke-check (no DB needed — validates require tree)
cd server && node -e "require('./app')"

# Client tests (React Testing Library)
cd client && CI=true npm test -- --watchAll=false

# Client production build (must produce zero warnings)
cd client && CI=true npm run build

# Prettier format check (from repo root)
npm run format:check
```

## Architecture

### API Layer
Routes mounted in `server/app.js`:
| Mount point | Route file | Controller |
|---|---|---|
| `/api/auth` | `routes/authRoutes.js` | `controllers/authController.js` |
| `/api/transcripts` | `routes/transcriptRoutes.js` | `controllers/transcriptController.js` |
| `/api/seals` | `routes/sealRoutes.js` | `controllers/sealController.js` |
| `/api/generator` | `routes/generatorRoutes.js` | `controllers/generatorController.js` |
| `/api/certificates` | `routes/certificateRoutes.js` | `controllers/certificateController.js` |
| `/api/design` | `routes/designSystemRoutes.js` | `controllers/designSystemController.js` |
| `/api/academic` | `routes/academicRoutes.js` | (inline handlers, 64 routes) |

### Service Layer
22 service files in `server/services/` implement business logic. Key services:
- `pdfService.js` – Puppeteer-based PDF generation from EJS templates
- `certificateService.js`, `certificateEnhancementsService.js` – certificate creation/customization
- `transcriptAutoGenerationService.js`, `transcriptEnhancementsService.js` – transcript generation
- `diplomaAutoGenerationService.js`, `diplomaFinishingService.js`, `premiumDiplomaService.js` – diploma workflows
- `designSystemService.js` – theme and layout management
- `gpaAutomationService.js`, `gpaCategoriesService.js` – GPA calculation
- `generationTogglesService.js` – feature flags and toggles
- `analyticsService.js`, `performanceService.js` – analytics/performance tracking
- `apiBackendService.js` – API orchestration and backend utilities
- `batchProcessingService.js` – bulk operations
- `exportDeliveryService.js` – export and delivery workflows
- `emailService.js` – nodemailer-based email delivery
- `registrarSealService.js` – seal generation and management
- `institutionResearchService.js` – institution data lookup
- `transferCreditsService.js` – transfer credit evaluation
- `transcriptLayoutService.js` – layout configuration

### Data Layer
- **Database**: PostgreSQL 15 via `pg` driver. Pool config in `server/config/database.js`.
- **Models**: 5 model files in `server/models/` (userModel, transcriptModel, sealModel, certificateModel, designThemeModel)
- **Schema**: 10 SQL files in `database/`. Docker-compose init order: `01-schema.sql`, `02-seal_schema.sql`. CI also runs both schema files before tests.
- All SQL queries use parameterized statements (`$1`, `$2`, etc.) — never concatenate user input.

### Client Layer
- **Framework**: React 19 with functional components and hooks
- **State management**: Context API (`client/src/context/AuthContext.js`)
- **Routing**: React Router v7 with future flags enabled
- **API services**: Axios wrappers in `client/src/services/` (authService, transcriptService, academicService)
- **Components**: `client/src/components/` — TranscriptGenerator, TranscriptEditor, TranscriptList, DragDropBuilder, Header, Footer, EnhancementsPanel, UIEnhancements
- **Pages**: `client/src/pages/` — Home, Login, Register, Transcript, Profile, About, Contact, NotFound
- **Utilities**: `client/src/utils/GPACalculator.js`

### Auth
- JWT via `jsonwebtoken`. Token stored in localStorage on client.
- `server/middleware/authMiddleware.js` extracts Bearer token from Authorization header.
- Secrets come from env vars only — **never hard-code JWT_SECRET or any credential**.

## Coding Conventions

### Server (CommonJS)
- **Module system**: `require()` / `module.exports` — do not use ES module syntax.
- **Variables**: Always `const` or `let`. Never `var` (`no-var` is an ESLint error).
- **Unused variables**: Prefix with `_` (e.g., `_error`, `_next`). `no-unused-vars` is an error.
- **Console**: `console.log` / `console.error` / `console.warn` are acceptable (`no-console` is off).
- **Error responses**: Database connection errors (`ECONNREFUSED`) → return 503, not 500.
- **DB pool error handler**: Must **not** call `process.exit()`.
- **Rate limiting**: Auth routes use `express-rate-limit` (15-min window, 20 requests).
- **Security headers**: Helmet is applied globally in `app.js`.
- **Static files**: Seal images served from `server/public/seals/` via `/seals` route.

### Client (React/ES Modules)
- **Module system**: `import` / `export`
- **Components**: Functional components with hooks. No class components.
- **State**: React Context for auth, local state with `useState`/`useReducer`.
- **API calls**: Always go through service files in `client/src/services/`.
- **Styling**: CSS files co-located with components (e.g., `Header.js` + `Header.css`).

### Formatting (Prettier)
- 100-character line width, 2-space indentation, single quotes, trailing commas (es5), LF line endings, no tabs.
- Config: `.prettierrc` at repo root. Ignore: `.prettierignore`.

## CI Pipeline

Four jobs in `.github/workflows/ci.yml` run on push to `main`/`develop`/`copilot/**` and PRs to `main`/`develop`:

1. **lint-and-format** – ESLint on server and client (continue-on-error, non-blocking)
2. **test-backend** – PostgreSQL 15 service container, runs `cd server && npm test`
3. **test-frontend** – `cd client && CI=true npm test -- --coverage --watchAll=false`
4. **build** – `cd client && npm run build` (depends on test jobs passing)

Additional workflows:
- **CodeQL** (`.github/workflows/codeql.yml`) – JavaScript security analysis on push/PR/weekly
- **Deploy** (`.github/workflows/deploy.yml`) – placeholder for production deployment on push to main

### Avoiding CI Breakage
- Run `cd server && npm run lint` before pushing server changes.
- Run `cd server && node -e "require('./app')"` as a quick smoke-check (no DB needed).
- Run `cd client && CI=true npm run build` before pushing client changes.
- Never commit `.env` files, secrets, or credentials.
- Server tests require PostgreSQL — they will fail without a running database.

## Dependency Management

- Use `npm ci` for reproducible installs in CI. Use `npm install` during development.
- `PUPPETEER_SKIP_DOWNLOAD=true` when installing server deps in sandboxed/CI environments.
- Root `package.json` manages workspaces and dev tools (concurrently, prettier, husky, lint-staged, playwright).
- Dependabot is configured for weekly updates to root, server, and client (`/.github/dependabot.yml`).
- Check for security advisories before adding or updating dependencies.

## Database Conventions

- Schema files in `database/` directory. Primary tables: `users`, `transcripts`, `courses`.
- Docker-compose mounts schema files as ordered init scripts (`01-schema.sql`, `02-seal_schema.sql`).
- CI runs both schema files explicitly before backend tests.
- Triggers maintain `updated_at` timestamps automatically.
- Use `CREATE TABLE IF NOT EXISTS` and `CREATE INDEX IF NOT EXISTS` patterns in schema files.
- Foreign keys use `ON DELETE CASCADE` where parent-child relationships exist.

## Security Rules

- **Never** hard-code secrets, API keys, or credentials in source code.
- **Never** commit `.env` files (covered by `.gitignore`).
- JWT secrets must come from `process.env.JWT_SECRET`.
- All SQL queries must use parameterized statements.
- Input validation via `express-validator` on route handlers.
- Rate limiting on sensitive endpoints (auth routes).
- Helmet for HTTP security headers.
- CORS configured with explicit origin allowlist.

## Documentation

When making changes, update relevant documentation:
- `API.md` — when adding or modifying API endpoints
- `ARCHITECTURE.md` — when changing system boundaries or component relationships
- `README.md` — when changing setup, features, or usage patterns
- `QUICKSTART.md` — when changing installation or getting-started steps
- `DEPLOYMENT.md` — when changing deployment configuration
- `SECURITY.md` — when changing security-relevant behavior

## Change-Scoping Rules

- Make the **smallest possible changes** that fully address the requirement.
- Do not modify unrelated code or fix pre-existing issues outside your scope.
- Maintain backward compatibility with existing API contracts.
- New routes must follow the established pattern: route → controller → service → model.
- New client API calls must go through service files, not direct axios calls in components.
- All new server code must pass ESLint (`cd server && npm run lint`).
- All new client code must not produce build warnings (`cd client && CI=true npm run build`).

## Anti-Patterns to Avoid

- Do not use `var` in any JavaScript file.
- Do not use ES module syntax (`import`/`export`) in server files.
- Do not call `process.exit()` in the database pool error handler.
- Do not hard-code database credentials, JWT secrets, or API keys.
- Do not concatenate user input into SQL queries — always use parameterized queries.
- Do not add direct axios calls in React components — use the service layer.
- Do not introduce class components in the client — use functional components with hooks.
- Do not skip the `_` prefix convention for intentionally unused variables.
- Do not remove or weaken existing security middleware (helmet, rate-limit, CORS, auth).
- Do not add `process.exit()` calls in library/service code — only in top-level server process handlers.
