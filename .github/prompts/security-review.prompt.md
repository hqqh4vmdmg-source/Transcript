---
mode: agent
description: "Audit dependencies and code for security vulnerabilities, secrets exposure, and unsafe patterns"
---

# Security Review

Perform a security audit of the codebase and dependencies.

## Dependency Audit
```bash
# Check for known vulnerabilities
(cd server && npm audit)
(cd client && npm audit)
npm audit  # Root dependencies

# List outdated packages
(cd server && npm outdated)
(cd client && npm outdated)
```

## Code Security Checklist

### Authentication & Authorization
- [ ] JWT tokens have expiration (`JWT_EXPIRES_IN` env var)
- [ ] `JWT_SECRET` is never hard-coded — sourced from `process.env`
- [ ] Auth middleware (`server/middleware/authMiddleware.js`) is applied to all protected routes
- [ ] Token is extracted from `Authorization: Bearer <token>` header only
- [ ] Failed auth attempts return 401, not 500
- [ ] Password hashing uses bcrypt with appropriate rounds

### SQL Injection
- [ ] All database queries in `server/models/` use parameterized statements (`$1`, `$2`)
- [ ] No string concatenation or template literals in SQL queries
- [ ] Raw user input is never passed directly to `db.query()`

### Input Validation
- [ ] `express-validator` is used on route handlers for user input
- [ ] File uploads (multer) have size limits configured (`MAX_FILE_SIZE` env var)
- [ ] Request body parsing has size limits (Express default or configured)

### Secrets & Credentials
- [ ] No secrets in source code (search for: passwords, API keys, tokens, connection strings)
- [ ] `.env` files are gitignored
- [ ] `.env.example` uses placeholder values, not real credentials
- [ ] Docker and CI files use environment variables or secrets, not hard-coded values

### HTTP Security
- [ ] Helmet middleware is applied (`app.use(helmet())` in `server/app.js`)
- [ ] CORS is configured with explicit origin allowlist
- [ ] Rate limiting is applied to auth endpoints
- [ ] Error responses in production do not leak stack traces

### Sensitive Data
- [ ] Passwords are never logged or returned in API responses
- [ ] JWT tokens are not stored in cookies without httpOnly flag
- [ ] User emails are not exposed in public-facing endpoints

## Search for Common Issues
```bash
# Search for hard-coded secrets
grep -rn -E "password[[:space:]]*=" server/ --include="*.js" | grep -v node_modules | grep -v .env | grep -v test
grep -rn -E "secret[[:space:]]*=" server/ --include="*.js" | grep -v node_modules | grep -v .env | grep -v test

# Search for string concatenation in SQL
grep -rn "query(\`" server/ --include="*.js" | grep -v node_modules
grep -rn "query('" server/ --include="*.js" | grep -v node_modules | grep "\+"

# Search for eval or unsafe patterns
grep -rn "eval(" server/ client/src/ --include="*.js"
grep -rn "innerHTML" client/src/ --include="*.js"
```
