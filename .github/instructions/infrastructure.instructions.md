---
applyTo: "Dockerfile,docker-compose.yml,.github/workflows/**,scripts/**,playwright.config.js"
---

# Infrastructure Instructions

## Overview
Infrastructure files cover Docker configuration, CI/CD workflows, utility scripts, and E2E test configuration.

## Docker

### Dockerfile (Production)
- Multi-stage build using `node:22-alpine`.
- Stage 1 (builder): Install deps, build client, copy source.
- Stage 2 (production): Copy built artifacts, create non-root user, expose port 5000.
- Healthcheck pings `/api/health` endpoint.
- Uses `npm ci --omit=dev` for production installs.

### docker-compose.yml
- **db**: PostgreSQL 15 Alpine, port 5432, ordered schema init files.
- **backend**: Builds from Dockerfile, depends on db health, port 5000.
- **frontend**: Dev build from `client/Dockerfile.dev`, port 3000.
- **nginx**: Reverse proxy, ports 80/443.
- Shared network: `transcript-network` (bridge).
- Persistent volume: `postgres_data`.

### Docker Conventions
- Use Alpine-based images for small container size.
- Run as non-root user in production containers.
- Include healthchecks in all service containers.
- Mount schema files with ordered prefixes (`01-`, `02-`) for init.

## CI/CD Workflows

### ci.yml (Main Pipeline)
Triggers: push to `main`/`develop`/`copilot/**`, PRs to `main`/`develop`.

Jobs:
1. **lint-and-format** — ESLint (non-blocking, `continue-on-error: true`)
2. **test-backend** — PostgreSQL 15 service, schema init, Jest tests
3. **test-frontend** — CRA tests with `CI=true`
4. **build** — Client production build (depends on test jobs)

### codeql.yml (Security)
- CodeQL JavaScript analysis on push/PR and weekly schedule.
- Runs on `main` and `develop` branches.

### deploy.yml (Deployment)
- Placeholder workflow triggered on push to `main`.
- Ready for real deployment steps.

### Workflow Conventions
- Use `actions/checkout@v4` and `actions/setup-node@v4`.
- Node.js version: 22 (match Dockerfile).
- Use `npm ci` for reproducible installs in CI.
- Cache npm packages via `actions/setup-node` cache option.
- Set `CI: true` environment variable for client builds/tests.

## Scripts

### scripts/backup.sh
- Creates PostgreSQL database dumps with timestamps.
- Uses `pg_dump` with password from environment.

### scripts/health-check.sh
- Checks API health endpoint and PostgreSQL readiness.

### scripts/migrate.sh
- Applies SQL migration files from `database/migrations/` directory.

### Script Conventions
- Use `set -e` for fail-fast behavior.
- Use environment variables for configuration (not hard-coded values).
- Use `${VAR:-default}` for optional variables with defaults.

## Validation
- After modifying CI workflows, verify YAML syntax: `yamllint .github/workflows/ci.yml` or use a YAML validator.
- After modifying Docker files, test locally: `docker build -t test .` and `docker-compose up`.
- After modifying scripts, test with `bash -n scripts/backup.sh` for syntax validation.

## Anti-Patterns
- Do not use `latest` tag for Docker base images — pin to specific versions.
- Do not run containers as root in production.
- Do not hard-code credentials in Docker or CI files — use environment variables or secrets.
- Do not skip healthchecks in docker-compose services.
- Do not add `continue-on-error: true` to test jobs — only lint jobs are non-blocking.
- Do not modify CI to skip tests or weaken the pipeline.
