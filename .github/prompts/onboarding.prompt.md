---
mode: agent
description: "Walk through the repository structure, architecture, and development workflows for a new contributor"
---

# Onboarding Walkthrough

Provide a comprehensive onboarding guide for a new developer joining this project.

## Walkthrough Structure

### 1. Project Overview
- This is a Transcript Generator web application — a full-stack monorepo using npm workspaces.
- **Backend**: Node.js/Express 5 REST API in `server/` (CommonJS, port 5000)
- **Frontend**: React 19 CRA app in `client/` (ES modules, port 3000, proxied to server)
- **Database**: PostgreSQL 15 with 10 schema files in `database/`

### 2. Getting Started
```bash
# Clone the repo
git clone <repo-url> && cd Transcript

# Install dependencies
cd server && PUPPETEER_SKIP_DOWNLOAD=true npm install
cd ../client && npm install

# Set up environment
cp server/.env.example server/.env
# Edit server/.env with your local PostgreSQL credentials

# Start PostgreSQL (via Docker or local install)
docker-compose up db -d

# Initialize database schema
PGPASSWORD=postgres psql -h localhost -U postgres -d transcript_generator -f database/schema.sql
PGPASSWORD=postgres psql -h localhost -U postgres -d transcript_generator -f database/seal_schema.sql

# Start the application
npm run dev  # Starts both server (port 5000) and client (port 3000)
```

### 3. Codebase Tour
Walk through these key files in order:
1. `server/app.js` — Express app setup, middleware, all route mounts
2. `server/routes/authRoutes.js` — Example route file with validation
3. `server/controllers/authController.js` — Example controller with error handling
4. `server/models/userModel.js` — Example model with parameterized queries
5. `server/middleware/authMiddleware.js` — JWT verification
6. `client/src/App.js` — React routing setup
7. `client/src/context/AuthContext.js` — Auth state management
8. `client/src/services/authService.js` — Example API service

### 4. Development Workflow
- Create a feature branch from `develop`
- Make changes following the conventions in `.github/copilot-instructions.md`
- Run validation: lint, smoke-check, tests, build
- Open a PR to `develop` using the PR template

### 5. Key Documentation
- `README.md` — Overview and setup
- `API.md` — All REST API endpoints
- `ARCHITECTURE.md` — System architecture
- `CONTRIBUTING.md` — How to contribute
- `ENHANCEMENTS.md` — 200 planned enhancements

### 6. Common Tasks
- **Add a new API endpoint**: route → controller → service → model → test → API.md
- **Add a new page**: component in `pages/` → route in `App.js` → service method if needed
- **Add a database table**: schema file in `database/` → model in `server/models/`
- **Run tests**: `cd server && npm test` (needs PostgreSQL), `cd client && CI=true npm test -- --watchAll=false`
