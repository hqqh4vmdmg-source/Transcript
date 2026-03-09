---
mode: agent
description: "Verify release readiness by checking tests, build, documentation, and deployment configuration"
---

# Release Readiness Check

Verify that the codebase is ready for a release.

## Checklist

### Build & Tests
- [ ] Server ESLint passes: `cd server && npm run lint`
- [ ] Server smoke-check passes: `cd server && node -e "require('./app')"`
- [ ] Server tests pass with coverage: `cd server && npm test`
- [ ] Client tests pass: `cd client && CI=true npm test -- --watchAll=false`
- [ ] Client production build succeeds with zero warnings: `cd client && CI=true npm run build`
- [ ] Prettier format check passes: `npm run format:check`
- [ ] No known test failures or skipped tests

### Security
- [ ] No hard-coded secrets in source code
- [ ] `.env` files are in `.gitignore`
- [ ] Dependencies have no known critical vulnerabilities: `npm audit`
- [ ] JWT_SECRET is sourced from environment variables
- [ ] SQL queries use parameterized statements
- [ ] Auth middleware is applied to all protected routes
- [ ] Rate limiting is configured on sensitive endpoints
- [ ] Helmet security headers are enabled

### Documentation
- [ ] `README.md` reflects current features and setup
- [ ] `API.md` documents all current endpoints
- [ ] `ARCHITECTURE.md` matches the current system design
- [ ] `DEPLOYMENT.md` has accurate deployment instructions
- [ ] `QUICKSTART.md` works for a fresh developer
- [ ] `CHANGELOG` or release notes are prepared (if applicable)

### Database
- [ ] Schema files execute successfully on a fresh database
- [ ] Docker-compose init order is correct (`01-schema.sql`, `02-seal_schema.sql`)
- [ ] No pending migrations that haven't been applied

### Deployment
- [ ] Dockerfile builds successfully: `docker build -t transcript-generator .`
- [ ] Docker-compose starts all services: `docker-compose up`
- [ ] Health endpoint responds: `curl http://localhost:5000/api/health`
- [ ] Environment variables documented in `.env.example`

### CI/CD
- [ ] CI pipeline passes on the release branch
- [ ] All four CI jobs succeed (lint, backend tests, frontend tests, build)
- [ ] CodeQL shows no new security alerts

## Run All Checks
```bash
# From repo root
cd server && npm run lint && node -e "require('./app')" && echo "Server OK"
cd ../client && CI=true npm run build && CI=true npm test -- --watchAll=false && echo "Client OK"
cd .. && npm run format:check && echo "Format OK"
npm audit --production && echo "No critical vulnerabilities"
```
