---
mode: agent
description: "Review code changes for correctness, security, conventions, and test coverage"
---

# Code Review

Perform a thorough code review of the current changes.

## Review Checklist

### Correctness
- [ ] Logic is correct and handles all edge cases
- [ ] Error paths are handled appropriately
- [ ] Return values and response shapes are correct
- [ ] Database queries are correct and use proper parameterization

### Security
- [ ] No hard-coded secrets, API keys, or credentials
- [ ] SQL queries use parameterized statements (`$1`, `$2`, etc.)
- [ ] Input validation is present on all user-supplied data
- [ ] Auth middleware is applied to protected routes
- [ ] No sensitive data exposed in error responses (production mode)
- [ ] Rate limiting preserved on sensitive endpoints

### Conventions
- [ ] Server code uses CommonJS (`require`/`module.exports`)
- [ ] Client code uses ES modules (`import`/`export`)
- [ ] `const` used where variables are not reassigned; `let` only when needed
- [ ] Unused parameters prefixed with `_`
- [ ] No `var` declarations
- [ ] Follows Express request flow: route → controller → service → model
- [ ] Client API calls go through service layer, not direct axios calls

### Testing
- [ ] New functionality has corresponding test coverage
- [ ] Existing tests are not removed or weakened
- [ ] Tests cover both success and error paths
- [ ] Test assertions are specific and meaningful

### Documentation
- [ ] API changes reflected in `API.md`
- [ ] Architecture changes reflected in `ARCHITECTURE.md`
- [ ] Setup changes reflected in `README.md` and `QUICKSTART.md`

### Performance
- [ ] No N+1 query patterns introduced
- [ ] Large data sets handled with pagination
- [ ] No unnecessary synchronous operations in async handlers

### Validation Commands
```bash
cd server && npm run lint
cd server && node -e "require('./app')"
cd server && npm test
cd client && CI=true npm run build
cd client && CI=true npm test -- --watchAll=false
```
