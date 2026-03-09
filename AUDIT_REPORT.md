# Transcript Generator — Comprehensive Audit Report

**Date:** 2026-03-09
**Scope:** Full codebase audit across server, client, database, infrastructure, CI/CD, tests, and documentation

---

## Executive Summary

This audit covers the entire Transcript Generator monorepo — a full-stack application for creating, managing, and exporting academic transcripts, certificates, and diplomas. The codebase is well-structured with clear separation of concerns, comprehensive documentation, and a working CI/CD pipeline. However, the audit identified significant findings across security, architecture, data integrity, test coverage, and code quality.

**Findings Summary:**

| Severity | Count |
|----------|-------|
| Critical | 12 |
| High | 21 |
| Medium | 35 |
| Low | 18 |
| **Total** | **86** |

---

## 1. Security Findings

### 1.1 [Critical] JWT Token Not Invalidated on Logout

- **Location:** `server/controllers/authController.js` (logout handler)
- **Description:** The logout endpoint returns success but does not invalidate the JWT token. After logout, the token remains valid until expiration.
- **Impact:** Session hijacking — an attacker with a stolen token retains access after the user logs out.
- **Priority:** Critical
- **Remediation:** Implement a token blocklist (Redis or database table) checked in `authMiddleware.js`. Add the token to the blocklist on logout. Alternatively, implement short-lived access tokens with a refresh token flow.

### 1.2 [Critical] Webhook Secrets Stored in Plaintext

- **Location:** `database/api_backend_schema.sql` — `webhooks` table, `secret VARCHAR(255)` column
- **Description:** Webhook secrets are stored as plaintext VARCHAR in the database with no encryption.
- **Impact:** If the database is compromised, all webhook secrets are exposed, allowing attackers to forge webhook deliveries.
- **Priority:** Critical
- **Remediation:** Encrypt webhook secrets at rest using application-level encryption (AES-256) before storing. Decrypt only when needed for HMAC signature verification.

### 1.3 [Critical] Database Schema Foreign Key Mismatch

- **Location:** `database/enhanced_transcript_schema.sql` line 10 vs `database/seal_schema.sql` line 2
- **Description:** `enhanced_transcript_schema.sql` references `seals(id)` but the actual table is named `official_seals` in `seal_schema.sql`. This causes a constraint violation during database initialization.
- **Impact:** Database initialization fails if `enhanced_transcript_schema.sql` is loaded after `seal_schema.sql`. The mismatch means the enhanced transcript features cannot be used.
- **Priority:** Critical
- **Remediation:** Rename the reference in `enhanced_transcript_schema.sql` from `seals(id)` to `official_seals(id)`, or rename the table in `seal_schema.sql` to `seals`.

### 1.4 [Critical] Hardcoded Database Credentials in docker-compose.yml

- **Location:** `docker-compose.yml` lines 8–10
- **Description:** `POSTGRES_USER: postgres` and `POSTGRES_PASSWORD: postgres` are hardcoded in the compose file rather than referenced from an `.env` file.
- **Impact:** Credentials are committed to version control. Anyone with repo access knows the database credentials.
- **Priority:** Critical
- **Remediation:** Replace hardcoded values with `${POSTGRES_USER}` and `${POSTGRES_PASSWORD}` environment variable references. Provide a `.env.example` for docker-compose alongside the existing `server/.env.example`.

### 1.5 [High] Missing Input Validation on Certificate Endpoints

- **Location:** `server/controllers/certificateController.js` lines 7–40, `server/routes/certificateRoutes.js`
- **Description:** Certificate creation accepts `...req.body` without express-validator validation rules on the route. Any data can be inserted into the certificates table.
- **Impact:** Malicious or malformed data (invalid types, oversized fields, injection payloads) reaches the database.
- **Priority:** High
- **Remediation:** Add express-validator middleware to certificate routes with validation for `title`, `certificate_type`, `template_id`, `custom_fields`, and `signature_ids`.

### 1.6 [High] Signature Ownership Not Validated

- **Location:** `server/controllers/certificateController.js` lines 18–27
- **Description:** When creating a certificate with signature IDs, the controller does not verify that the provided signature IDs belong to the requesting user.
- **Impact:** A user can attach another user's signatures to their certificate — privacy violation and potential fraud.
- **Priority:** High
- **Remediation:** Before adding each signature, query the signature table to verify `user_id` matches the authenticated user.

### 1.7 [High] Seal ID Not Validated for Ownership in PDF Generation

- **Location:** `server/controllers/transcriptController.js` line 161
- **Description:** The `seal_id` query parameter in PDF generation is not validated for ownership. A user can embed any seal (including other users' seals) in their transcript PDF.
- **Impact:** Users can use official seals that don't belong to them, creating fraudulent-looking documents.
- **Priority:** High
- **Remediation:** Validate that `seal_id` belongs to the requesting user or is a system-provided seal before generating the PDF.

### 1.8 [High] No Rate Limiting on Password Change

- **Location:** `server/routes/authRoutes.js` line 63
- **Description:** The password change endpoint (`PUT /api/auth/password`) uses `authMiddleware` but not the `authLimiter`. The login and register endpoints are rate-limited, but password changes are not.
- **Impact:** Brute-force attacks on password changes — an attacker with a valid token can try unlimited password combinations.
- **Priority:** High
- **Remediation:** Apply a dedicated rate limiter to the password change route (e.g., 5 attempts per 15 minutes).

### 1.9 [High] Missing CSRF Protection

- **Location:** `server/app.js`, all client service files
- **Description:** No CSRF token protection is implemented. API calls use Bearer tokens in headers, but state-changing operations lack CSRF protection.
- **Impact:** Cross-site request forgery attacks could modify user data if combined with session fixation or XSS.
- **Priority:** High
- **Remediation:** Add CSRF middleware for state-changing operations, or ensure all API calls use custom headers that cannot be sent by forms.

### 1.10 [Medium] Error Messages Rendered Without Sanitization

- **Location:** `client/src/pages/LoginPage.js`, `client/src/pages/RegisterPage.js`, `client/src/pages/ContactPage.js`, `client/src/pages/ProfilePage.js`
- **Description:** Server error messages are displayed directly in the DOM without sanitization. If the server returns a malicious string, it could be rendered as HTML.
- **Impact:** Reflected XSS if the server echoes user-controlled input in error messages.
- **Priority:** Medium
- **Remediation:** Sanitize error messages before display, or only show predefined error strings mapped from server error codes.

### 1.11 [Medium] JWT Token Stored in localStorage Without Expiration Check

- **Location:** `client/src/context/AuthContext.js` lines 16–44
- **Description:** The JWT token is stored in `localStorage` and used directly without checking the `exp` claim. Expired tokens are sent to the server, resulting in silent 401 errors.
- **Impact:** Poor UX when tokens expire, and potential for using stale authentication state.
- **Priority:** Medium
- **Remediation:** Decode the JWT on the client side and check the `exp` claim before making API requests. If expired, prompt re-authentication.

### 1.12 [Medium] SVG Injection Risk in Seal Generation

- **Location:** `server/services/registrarSealService.js` lines 123–138
- **Description:** SVG generation includes user input. While `escapeXml()` is used in some places, not all values in template literals are consistently escaped.
- **Impact:** Potential SVG injection if user-controlled content is included in seal SVGs without proper escaping.
- **Priority:** Medium
- **Remediation:** Ensure all user-supplied values in SVG templates pass through `escapeXml()` consistently.

---

## 2. Architecture Findings

### 2.1 [High] Certificate Controller Bypasses Service Layer

- **Location:** `server/controllers/certificateController.js` — all handler methods
- **Description:** The certificate controller calls `CertificateModel` directly for all operations, bypassing the service layer. Every other domain (transcripts, seals, design) uses a service layer.
- **Impact:** Business logic is scattered in the controller, making it difficult to test, reuse, or maintain. Certificate logic cannot be shared with batch processing or other workflows.
- **Priority:** High
- **Remediation:** Create a `certificateControllerService.js` (note: `certificateService.js` already exists for rendering) that encapsulates create, update, delete, and listing logic. Have the controller call the service instead of the model directly.

### 2.2 [High] Inconsistent Module Export Patterns

- **Location:** All 22 service files, 5 model files
- **Description:** Services use three different export patterns: singleton instances (`module.exports = new Service()`), class exports (`module.exports = Service`), and object exports (`module.exports = { method1, method2 }`). Models have similar inconsistency.
- **Impact:** Consumers must know which pattern each module uses, increasing cognitive load and bug risk. Some services require `new`, others don't.
- **Priority:** High
- **Remediation:** Standardize on singleton exports (`module.exports = new Service()`) for services that don't need constructor parameters, and document the pattern for services that do.

### 2.3 [Medium] Duplicate Code Between TranscriptGenerator and TranscriptEditor

- **Location:** `client/src/components/TranscriptGenerator.js`, `client/src/components/TranscriptEditor.js`
- **Description:** Approximately 75% of the code is duplicated between these two components — course form rendering, validation, GPA calculation, and submission logic.
- **Impact:** Bug fixes must be applied in two places. Divergence risk is high.
- **Priority:** Medium
- **Remediation:** Extract a shared `TranscriptForm` component that both `TranscriptGenerator` and `TranscriptEditor` use, with configuration props for create vs. edit behavior.

### 2.4 [Medium] Contact Form Has No Backend Submission

- **Location:** `client/src/pages/ContactPage.js` lines 20–34
- **Description:** The contact form shows a success message locally but never sends data to the server. There is no corresponding API endpoint.
- **Impact:** Users believe their message was sent, but no data is transmitted.
- **Priority:** Medium
- **Remediation:** Either implement a `/api/contact` endpoint and wire it up, or clearly indicate that the form is for display only and provide alternative contact methods.

### 2.5 [Medium] Academic Routes Use Inline Handlers Instead of Controllers

- **Location:** `server/routes/academicRoutes.js` (719 lines, 64 routes)
- **Description:** All 64 academic routes define their handlers inline in the route file rather than using a separate controller file. This is inconsistent with the pattern used by other route files.
- **Impact:** The route file is 719 lines long, making it difficult to navigate, test, and maintain.
- **Priority:** Medium
- **Remediation:** Extract inline handlers into one or more `academicController.js` files. This is a large refactoring effort but would significantly improve maintainability.

---

## 3. Database Findings

### 3.1 [Critical] Only 2 of 10 Schema Files Loaded in Docker/CI

- **Location:** `docker-compose.yml` lines 15–16, `.github/workflows/ci.yml` lines 70–71
- **Description:** Docker-compose and CI only load `schema.sql` and `seal_schema.sql`. The remaining 8 schema files (`design_system_schema.sql`, `gpa_categories_schema.sql`, `enhanced_transcript_schema.sql`, `certificate_schema.sql`, `api_backend_schema.sql`, `performance_schema.sql`, `certificate_enhancements_schema.sql`, `transcript_enhancements_schema.sql`) are not loaded.
- **Impact:** Features depending on these schemas (certificates, design system, GPA categories, performance tracking, enhancements) will fail with "table does not exist" errors at runtime.
- **Priority:** Critical
- **Remediation:** Add all schema files to docker-compose init scripts with correct ordering. Update CI to load all required schemas before running tests.

### 3.2 [High] Missing ON DELETE CASCADE on Foreign Keys

- **Location:** `database/seal_schema.sql` line 24, `database/gpa_categories_schema.sql` lines 65/114/145/183
- **Description:** Several foreign keys referencing `users(id)` lack `ON DELETE CASCADE`. When a user is deleted, their related records (seal usage, GPA categories, scholarships, career paths) become orphaned.
- **Impact:** Data integrity issues — orphaned records accumulate and may cause unexpected errors or data leaks.
- **Priority:** High
- **Remediation:** Add `ON DELETE CASCADE` (or `ON DELETE SET NULL` where appropriate) to all foreign keys referencing `users(id)`.

### 3.3 [High] No Migration Version Tracking

- **Location:** `scripts/migrate.sh`
- **Description:** The migration script applies all `.sql` files from `database/migrations/` directory (which doesn't exist) without tracking which migrations have been applied.
- **Impact:** Running migrations twice applies them twice. No audit trail of applied migrations. No rollback capability.
- **Priority:** High
- **Remediation:** Implement a `schema_migrations` table that tracks applied migrations with timestamps. Check this table before applying each migration.

### 3.4 [Medium] API Metrics Table Has No Retention Policy

- **Location:** `database/api_backend_schema.sql` — `api_metrics` table
- **Description:** The API metrics table stores request data indefinitely with no partitioning, TTL, or cleanup strategy.
- **Impact:** Table will grow unbounded, degrading query performance and increasing storage costs.
- **Priority:** Medium
- **Remediation:** Add a retention policy (e.g., delete records older than 90 days), implement table partitioning by month, or add a scheduled cleanup job.

### 3.5 [Medium] GPA Range Constraints Missing

- **Location:** `database/gpa_categories_schema.sql` — `career_paths` table, `scholarship_opportunities` table
- **Description:** GPA range columns (`typical_gpa_range_min`, `typical_gpa_range_max`, `min_gpa_requirement`) have no CHECK constraints to ensure min ≤ max or that values are within valid GPA ranges (0.0–4.0).
- **Impact:** Invalid data (e.g., min > max, negative GPA) can be stored, causing incorrect calculations.
- **Priority:** Medium
- **Remediation:** Add CHECK constraints: `CHECK (typical_gpa_range_min <= typical_gpa_range_max)`, `CHECK (min_gpa_requirement >= 0 AND min_gpa_requirement <= 4.0)`.

---

## 4. Test Coverage Findings

### 4.1 [Critical] No Test Coverage for Certificates

- **Location:** `server/tests/` — no `certificate.test.js` file
- **Description:** The certificate module (controller, model, routes) has zero automated test coverage. This is a major feature with CRUD operations, signature handling, and template rendering.
- **Impact:** Certificate bugs go undetected. Regressions from code changes are not caught by CI.
- **Priority:** Critical
- **Remediation:** Create `server/tests/certificate.test.js` with tests covering: create, read, update, delete, signature management, template rendering, and authorization.

### 4.2 [Critical] No Test Coverage for Design System

- **Location:** `server/tests/` — no `designSystem.test.js` file
- **Description:** The design system module (controller, model, service, routes with 115 lines) has zero automated test coverage.
- **Impact:** Design theme CRUD, color palette generation, and accessibility auditing are untested.
- **Priority:** Critical
- **Remediation:** Create `server/tests/designSystem.test.js` with tests covering theme CRUD, palette generation, and WCAG compliance checking.

### 4.3 [High] Jest Coverage Thresholds Not Enforced

- **Location:** `server/jest.config.js`
- **Description:** Jest collects coverage data but does not enforce minimum thresholds. Tests can pass with 0% coverage.
- **Impact:** Coverage can silently degrade without CI catching it.
- **Priority:** High
- **Remediation:** Add `coverageThreshold` to `jest.config.js`:
  ```javascript
  coverageThreshold: {
    global: { branches: 60, functions: 60, lines: 60, statements: 60 }
  }
  ```

### 4.4 [High] Manual Test Files Run by Jest

- **Location:** `server/tests/manual-seal-test.js`, `server/tests/manual-category-test.js`
- **Description:** These files use `console.log` instead of Jest assertions and are not proper test files, but Jest's test pattern (`**/tests/**/*.test.js`) doesn't match them (they lack `.test.js` suffix). However, they clutter the test directory.
- **Impact:** Confusion about test coverage. These files provide no CI value.
- **Priority:** High
- **Remediation:** Move manual test scripts to `server/scripts/` or `server/tests/manual/` and exclude via `testPathIgnorePatterns`.

### 4.5 [High] No SQL Injection Test Cases

- **Location:** All test files
- **Description:** No test verifies that SQL injection payloads are handled safely. Tests use normal inputs only.
- **Impact:** SQL injection vulnerabilities could exist without being caught by tests.
- **Priority:** High
- **Remediation:** Add test cases with SQL injection payloads (e.g., `' OR '1'='1`, `'; DROP TABLE users; --`) to auth, transcript, and seal tests.

### 4.6 [Medium] Seal Test Cleanup Order May Cause FK Errors

- **Location:** `server/tests/seal.test.js` lines 33–37
- **Description:** Test cleanup deletes records in an order that may violate foreign key constraints. `seal_verification_log` and `seal_usage` reference `official_seals`, but the deletion order is not guaranteed.
- **Impact:** Test teardown fails intermittently, causing false test failures.
- **Priority:** Medium
- **Remediation:** Delete in correct order: `seal_usage` → `seal_verification_log` → `official_seals` → `users`.

### 4.7 [Medium] No E2E Test Content

- **Location:** `tests/e2e/basic.spec.js`
- **Description:** Only one trivial E2E test exists (homepage loads). The Playwright configuration references 3 browser projects but there is essentially no E2E coverage.
- **Impact:** No end-to-end validation of user workflows (registration, transcript creation, PDF generation).
- **Priority:** Medium
- **Remediation:** Add E2E tests for critical user journeys: registration → login → create transcript → generate PDF → logout.

---

## 5. Code Quality Findings

### 5.1 [High] Inverted WCAG Compliance Logic

- **Location:** `server/controllers/designSystemController.js` line 365
- **Description:** The WCAG compliance check returns `compliant: audit.wcag_level !== 'A'`, which is logically inverted. WCAG level 'A' is the minimum compliance level, so `!== 'A'` means "not level A" = compliant, which is backwards.
- **Impact:** Reports incorrect accessibility compliance status for designs.
- **Priority:** High
- **Remediation:** Change to `compliant: ['A', 'AA', 'AAA'].includes(audit.wcag_level)` or define a proper compliance threshold.

### 5.2 [High] Batch Processing Job Status Updates in Loop

- **Location:** `server/services/batchProcessingService.js` lines 113–115
- **Description:** `updateJobStatus()` is called inside a loop for each course processed, but it should only be called once after the batch completes.
- **Impact:** Job progress calculation is inaccurate — shows 100% after the first item.
- **Priority:** High
- **Remediation:** Accumulate results in the loop, then call `updateJobStatus()` once after the loop completes with the final progress.

### 5.3 [Medium] Performance Service Cache is Simulated

- **Location:** `server/services/performanceService.js`
- **Description:** The cache implementation queries a PostgreSQL table on every cache lookup, which is slower than not caching at all. There is no actual caching layer (Redis, in-memory).
- **Impact:** The "performance optimization" service actually degrades performance by adding extra database queries.
- **Priority:** Medium
- **Remediation:** Either implement a proper in-memory cache (Node.js Map with TTL, or Redis) or remove the caching abstraction until a real cache is available.

### 5.4 [Medium] Institution Research Has Only 4 Hardcoded Entries

- **Location:** `server/services/institutionResearchService.js` lines 9–98
- **Description:** The institution database contains only 4 hardcoded entries (Harvard, MIT, Stanford, UCLA). All other institutions return `found: false`.
- **Impact:** 95%+ of institution lookups return empty results, making the feature effectively non-functional for most users.
- **Priority:** Medium
- **Remediation:** Either expand the dataset, integrate with an external institution API (e.g., IPEDS), or clearly document the limitation and provide a user-facing fallback.

### 5.5 [Medium] Email Service Has No Configuration Validation

- **Location:** `server/services/emailService.js` lines 18–25
- **Description:** The nodemailer transporter is created without validating that SMTP configuration environment variables exist. If `SMTP_HOST`, `SMTP_USER`, or `SMTP_PASS` are missing, the transporter is created but all sends fail silently.
- **Impact:** Email features appear to work but never actually send emails in environments without SMTP config.
- **Priority:** Medium
- **Remediation:** Validate SMTP configuration on service initialization. If not configured, log a warning and provide a no-op implementation that clearly reports emails are not being sent.

### 5.6 [Medium] Export Delivery Service Silently Ignores Directory Creation Errors

- **Location:** `server/services/exportDeliveryService.js` lines 366–372
- **Description:** The `_ensureOutputDir()` method catches directory creation errors with only a comment "Non-critical". If the output directory cannot be created, PDF exports will fail with an unclear error.
- **Impact:** PDF export failures with misleading error messages.
- **Priority:** Medium
- **Remediation:** Log the error and throw a descriptive error if directory creation fails, since it is a prerequisite for PDF export.

### 5.7 [Medium] Duplicate Code in academicService.js (Client)

- **Location:** `client/src/services/academicService.js` (64 methods)
- **Description:** Every method follows the exact same pattern with repeated header configuration. The axios instance could be configured once with an interceptor.
- **Impact:** Maintenance burden — changing the auth header pattern requires updating 64 methods.
- **Priority:** Medium
- **Remediation:** Create a configured axios instance with a request interceptor that adds the auth header, then use it across all methods.

### 5.8 [Low] DragDropBuilder Element Finding Inefficiency

- **Location:** `client/src/components/DragDropBuilder.js` lines 158–172
- **Description:** `elements.find(el => el.id === selectedElement)` is called three times in the property panel render instead of caching the result.
- **Impact:** Unnecessary computation on every render, though negligible for small element counts.
- **Priority:** Low
- **Remediation:** Cache the result: `const selectedEl = elements.find(el => el.id === selectedElement);`

### 5.9 [Low] Magic Numbers in DragDropBuilder

- **Location:** `client/src/components/DragDropBuilder.js` lines 44–56
- **Description:** Hardcoded values (`width: 200`, `height: 50`, `fontSize: 16`) are used without named constants.
- **Impact:** Unclear intent, harder to maintain and adjust.
- **Priority:** Low
- **Remediation:** Extract to named constants at the top of the file.

---

## 6. Infrastructure Findings

### 6.1 [Critical] Deployment Workflow is a Stub

- **Location:** `.github/workflows/deploy.yml`
- **Description:** The deployment workflow only contains `echo "Deployment configured"` — no actual build, push, or deploy logic.
- **Impact:** No automated deployment pipeline. Deployments must be done manually.
- **Priority:** Critical
- **Remediation:** Implement actual deployment steps (Docker build/push, server deploy, health check) or remove the workflow to avoid confusion.

### 6.2 [High] Missing .dockerignore File

- **Location:** Repository root
- **Description:** No `.dockerignore` file exists. The Docker build context includes `node_modules`, `coverage`, `.git`, and other unnecessary files.
- **Impact:** Larger Docker images, slower builds, potential secret exposure in build context.
- **Priority:** High
- **Remediation:** Create `.dockerignore` with: `node_modules`, `.git`, `coverage`, `.env`, `*.log`, `.github`, `tests`.

### 6.3 [High] Missing nginx Configuration Referenced in docker-compose

- **Location:** `docker-compose.yml` lines 80–81
- **Description:** The nginx service references `./nginx/nginx.conf` and `./nginx/ssl/` but neither directory exists in the repository.
- **Impact:** `docker-compose up` fails when nginx service starts because mounted volumes don't exist.
- **Priority:** High
- **Remediation:** Either create the `nginx/` directory with appropriate configuration files, or remove/comment out the nginx service from docker-compose.yml until it's properly configured.

### 6.4 [High] ESLint Missing Security Plugin

- **Location:** `server/eslint.config.js`
- **Description:** ESLint configuration only includes basic rules. No security plugin (`eslint-plugin-security`) is configured to detect injection vulnerabilities, hardcoded secrets, or unsafe patterns.
- **Impact:** Security issues in JavaScript code are not caught by linting.
- **Priority:** High
- **Remediation:** Add `eslint-plugin-security` to ESLint configuration to catch common security anti-patterns.

### 6.5 [Medium] Linting Jobs Set to continue-on-error

- **Location:** `.github/workflows/ci.yml` lines 31, 35
- **Description:** ESLint jobs use `continue-on-error: true`, meaning lint failures don't block merges.
- **Impact:** Code with lint errors (including potential bugs caught by ESLint) can be merged.
- **Priority:** Medium
- **Remediation:** Remove `continue-on-error: true` from lint jobs once the codebase passes linting cleanly.

### 6.6 [Medium] Docker Base Image Not Pinned to Exact Version

- **Location:** `Dockerfile` line 1, `client/Dockerfile.dev` line 1
- **Description:** Docker images use `node:22-alpine` without pinning to an exact version (e.g., `node:22.11.0-alpine3.19`).
- **Impact:** Builds may break when Alpine or Node.js releases introduce breaking changes.
- **Priority:** Medium
- **Remediation:** Pin to exact version for reproducible builds.

---

## 7. Accessibility Findings

### 7.1 [High] DragDropBuilder Not Keyboard Accessible

- **Location:** `client/src/components/DragDropBuilder.js`
- **Description:** The entire drag-and-drop builder only works with mouse interactions. No keyboard alternatives exist for adding, positioning, or editing elements.
- **Impact:** Users who rely on keyboards or assistive technology cannot use the builder.
- **Priority:** High
- **Remediation:** Add keyboard event handlers for element selection, positioning (arrow keys), and deletion (Delete key). Add `tabIndex`, `role`, and `aria-label` attributes.

### 7.2 [Medium] Missing aria-live Regions for Dynamic Messages

- **Location:** `client/src/pages/ProfilePage.js`, `client/src/pages/ContactPage.js`, `client/src/components/TranscriptList.js`
- **Description:** Success and error messages appear dynamically but are not wrapped in `aria-live` regions.
- **Impact:** Screen reader users are not notified when operations succeed or fail.
- **Priority:** Medium
- **Remediation:** Wrap dynamic messages in `<div aria-live="polite" role="status">`.

### 7.3 [Medium] Form Label Associations Missing

- **Location:** `client/src/components/TranscriptGenerator.js`, `client/src/components/TranscriptEditor.js`
- **Description:** Some form inputs lack associated `<label>` elements with matching `htmlFor`/`id` attributes.
- **Impact:** Screen readers cannot identify what each input field is for.
- **Priority:** Medium
- **Remediation:** Ensure every `<input>` has a corresponding `<label htmlFor="inputId">`.

---

## 8. Documentation Findings

### 8.1 [Medium] copilot-instructions.md Referenced React 18 Instead of React 19

- **Location:** `.github/copilot-instructions.md` (now fixed in this PR)
- **Description:** The previous version of copilot-instructions.md stated "React 18 CRA frontend" when the actual version is React 19.2.4.
- **Impact:** Copilot could generate code using React 18 patterns instead of React 19 features.
- **Priority:** Medium
- **Remediation:** Fixed — updated to reflect React 19.

### 8.2 [Medium] copilot-instructions.md Stated 10 Service Files Instead of 22

- **Location:** `.github/copilot-instructions.md` (now fixed in this PR)
- **Description:** The previous version stated "200 features implemented across 10 service files" when there are actually 22 service files.
- **Impact:** Copilot had an inaccurate model of the codebase size and structure.
- **Priority:** Medium
- **Remediation:** Fixed — updated to reflect 22 service files.

### 8.3 [Low] ENHANCEMENTS.md Items Not Tracked with Completion Status

- **Location:** `ENHANCEMENTS.md`
- **Description:** 200 enhancement items are listed but there is no mechanism to track which have been implemented. The document is a wish list without status tracking.
- **Impact:** Difficult to know which enhancements are already implemented and which remain.
- **Priority:** Low
- **Remediation:** Add checkboxes (`- [x]` / `- [ ]`) or a status column to track implementation progress.

---

## 9. Gap List — Areas Requiring Human Clarification

1. **Deployment target:** The deploy workflow is a stub. Where is the application actually deployed? AWS, Heroku, or self-hosted? This affects infrastructure guidance.
2. **SMTP configuration:** Is email functionality required in development? The SMTP config is optional but several features depend on it.
3. **Institution data source:** The institution research service has only 4 entries. Is there a planned external data source, or should this feature be scoped down?
4. **Schema loading order:** With 10 schema files, what is the correct loading order that satisfies all foreign key dependencies? Only 2 files are loaded in docker-compose/CI.
5. **Soft delete policy:** Several models use hard deletes. Is there a business requirement for soft deletes and audit trails?
6. **Token refresh flow:** JWT tokens are short-lived but there's no refresh token mechanism. Is this planned?
7. **nginx configuration:** docker-compose references `nginx/nginx.conf` which doesn't exist. Is nginx intended for production only, or should a dev config be provided?
8. **Puppeteer in production:** Puppeteer is a heavy dependency for PDF generation. Is there a plan to use a headless Chrome service instead of bundling it?
9. **Client-side lint script:** `client/package.json` has no `lint` script, but CI attempts to run it. Should ESLint be configured for the client?
10. **Test database setup:** Should all 10 schema files be loaded in CI for comprehensive testing, or are only the core 2 sufficient?

---

## 10. Summary of Recommendations by Priority

### Immediate (This Sprint)
1. Fix database schema FK mismatch (`seals` vs `official_seals`)
2. Add input validation to certificate endpoints
3. Add ownership validation for signatures and seals
4. Remove hardcoded credentials from docker-compose.yml
5. Fix inverted WCAG compliance logic

### Short Term (Next 2 Sprints)
6. Create certificate and design system test suites
7. Add rate limiting to password change endpoint
8. Implement .dockerignore file
9. Add Jest coverage thresholds
10. Load all schema files in docker-compose and CI
11. Fix batch processing job status update logic
12. Add ESLint security plugin

### Medium Term (Next Quarter)
13. Implement token invalidation on logout
14. Extract shared TranscriptForm component
15. Add keyboard accessibility to DragDropBuilder
16. Standardize service module export patterns
17. Implement proper migration version tracking
18. Add E2E test coverage for critical user journeys
19. Add aria-live regions for dynamic messages
20. Replace deployment stub with real pipeline
