# Enhancements & Polish Items

This document tracks 200 areas identified for improvement to make the Transcript Generator application fully finished and polished.

---

## 🔐 Security (Items 1–20)

1. **Enforce HTTPS redirect** – Add `express-enforce-ssl` or reverse-proxy config to redirect all HTTP to HTTPS in production.
2. **CSRF protection** – Add `csurf` middleware (or `double-submit cookie` pattern) to protect state-mutating API endpoints.
3. **Refresh token flow** – Implement JWT refresh tokens so users are not silently logged out after 1 hour.
4. **Secure cookie for JWT** – Store JWT in an `httpOnly, Secure, SameSite=Strict` cookie instead of returning it in the JSON body.
5. **Password strength policy** – Enforce password complexity rules (uppercase, digit, special character) with `zxcvbn` or custom validator.
6. **Account lockout** – Lock account after N consecutive failed login attempts and send an unlock email.
7. **Argon2 password hashing** – Replace `bcrypt` with `argon2` for stronger resistance to GPU brute-force.
8. **Audit log table** – Record authentication events (login, logout, failed attempts, password changes) to an `audit_log` DB table.
9. **Input sanitization** – Add `express-mongo-sanitize` / `xss-clean` to strip dangerous characters from all request bodies.
10. **SQL parameterisation review** – Audit all raw SQL in model files to confirm every value uses parameterised queries, not string interpolation.
11. **Content-Security-Policy header** – Configure `helmet` CSP to restrict script/style/image sources to trusted origins.
12. **Subresource integrity** – Add `integrity` attributes to any third-party CDN links in `public/index.html`.
13. **Dependency audit** – Run `npm audit fix` on both `server/` and `client/` and update vulnerable packages.
14. **Secret rotation support** – Support multiple JWT secrets via a `JWT_SECRET_PREVIOUS` env var so secrets can be rotated without logging everyone out.
15. **Rate limit on registration** – The existing auth limiter covers login; verify it also applies to `/api/auth/register` to prevent spam.
16. **Email verification** – Require users to verify their email address before they can generate transcripts.
17. **PDF watermarking** – Optionally watermark generated PDFs with "UNOFFICIAL" to prevent misuse of draft transcripts.
18. **File upload validation** – Validate MIME type, file size, and scan uploaded seal images server-side before storing.
19. **CORS origin whitelist** – Replace the single `CLIENT_URL` origin with an array-based allowlist to support multiple environments.
20. **Security.md freshness** – Update `SECURITY.md` with actual vulnerability-reporting contact info and a SLA commitment.

---

## 🏗️ Architecture & Code Quality (Items 21–45)

21. **Centralised error handler class** – Replace ad-hoc `res.status(500)` calls with a custom `AppError` class and single error-handler middleware.
22. **Async wrapper utility** – Add an `asyncHandler` HOF to eliminate `try/catch` boilerplate in every controller function.
23. **Controller input validation middleware** – Move validation rules out of route files into dedicated `validators/` files.
24. **Repository / DAO pattern** – Abstract all DB queries behind repository classes so controllers never touch SQL directly.
25. **Dependency injection** – Wire services via constructor injection rather than `require()` at module scope to simplify testing and mocking.
26. **CommonJS → ESM migration** – Migrate `server/` to ESM (`import`/`export`) to align with modern Node.js standards.
27. **Unused service files cleanup** – `analyticsService.js`, `performanceService.js`, and several others expose routes but have no real DB persistence; either wire them up or remove placeholder stubs.
28. **Remove duplicate GPA calculators** – `server/utils/gpaCalculator.js` and `client/src/utils/GPACalculator.js` share logic; extract to a shared package.
29. **Shared validation schemas** – Define Joi/Zod schemas once (in a `shared/` workspace) and import from both client and server.
30. **Configuration module** – Replace scattered `process.env.X` references with a validated config module that throws on startup if required vars are missing.
31. **Logging library** – Replace `console.log/error` with a structured logger (e.g., `pino`) so logs are JSON-formatted in production.
32. **Correlation IDs** – Add a request-id middleware so every log line for a request shares the same ID.
33. **OpenAPI / Swagger spec** – Document all REST endpoints with an OpenAPI 3 spec and serve it via `/api/docs`.
34. **Consistent HTTP status codes** – Audit controllers: some conflict errors return `400` where `409 Conflict` is more appropriate.
35. **Pagination for list endpoints** – `GET /api/transcripts` returns all records; add `limit`/`offset` (or cursor-based) pagination.
36. **Sorting and filtering** – Allow clients to sort/filter transcript lists by date, type, GPA.
37. **Idempotent PUT endpoints** – Replace PATCH-style partial updates with proper `PUT` semantics for transcript updates.
38. **Transactions for multi-step writes** – Wrap transcript-creation (insert transcript + courses) in a single DB transaction to prevent partial writes.
39. **Dead-code removal** – `server/utils/logoGenerator.js` is imported nowhere; remove or integrate it.
40. **Manual test files** – `server/tests/manual-category-test.js` and `server/tests/manual-seal-test.js` are not Jest tests; move them to `scripts/` or delete.
41. **Consistent service return types** – Some services return raw objects, others return `{ success, data }` wrappers; standardise across all services.
42. **Remove academic route stubs** – Many `/api/academic` routes call services that return hardcoded demo data; either implement DB persistence or document them as simulation-only.
43. **Route versioning** – Prefix all routes with `/api/v1/` to allow future breaking changes without disrupting existing clients.
44. **Environment-specific configs** – Add `config/` files for `development`, `test`, and `production` instead of relying solely on env vars.
45. **Package.json workspaces** – Make `server/` and `client/` proper npm workspaces so `npm install` at the root installs everything.

---

## 🗄️ Database (Items 46–65)

46. **Missing indexes** – Add indexes on `transcripts.user_id`, `courses.transcript_id`, and `users.email` for query performance.
47. **Cascade deletes** – Ensure deleting a transcript automatically cascades to its `courses` rows via `ON DELETE CASCADE`.
48. **Schema versioning** – Add a `schema_migrations` table and use a migration tool (e.g., `db-migrate` or `Flyway`) instead of raw SQL files.
49. **Single schema file** – Consolidate the 9 schema SQL files into one canonical schema (with migrations for changes) to avoid confusion.
50. **Soft deletes** – Add `deleted_at TIMESTAMPTZ` to `transcripts` and `users` tables so data is recoverable.
51. **`updated_at` trigger** – Add a PostgreSQL trigger to auto-update `updated_at` on every row modification.
52. **UUID primary keys** – Replace integer serial PKs with `uuid` PKs to avoid ID enumeration attacks.
53. **Connection pooling config** – Expose pool `min`, `max`, `idleTimeoutMillis` settings via env vars for tuning.
54. **Health check includes DB** – Expand `GET /api/health` to test a DB connection and report degraded status if the pool is exhausted.
55. **Read replicas** – Abstract the pool config to support a read replica for `SELECT` queries.
56. **Full-text search** – Add a `tsvector` column and GIN index on transcript data for searching by student name, course, etc.
57. **GPA history table** – Store historical GPA snapshots so changes over time can be audited.
58. **Archived transcripts** – Add an `archived` boolean so users can hide old transcripts without deleting them.
59. **Transcript versioning** – Store previous versions of transcript data in a `transcript_versions` table.
60. **Seal image storage** – Store seal images in S3/object-storage (or DB BLOB) rather than the local filesystem to support multi-instance deployments.
61. **Prepared statements** – Use `pg`'s named prepared statements for frequently executed queries.
62. **DB connection error recovery** – On `ECONNREFUSED`, implement exponential back-off reconnect instead of letting the pool hang.
63. **Test database isolation** – Each test file should create/drop its own schema to allow parallel test execution.
64. **Seed script** – Provide a `database/seed.sql` with sample data for onboarding new developers.
65. **Backup documentation** – Document the `scripts/backup.sh` approach and add a restore script.

---

## 🖥️ Frontend – React Components (Items 66–95)

66. **Protected route component** – Create a `<ProtectedRoute>` wrapper that redirects unauthenticated users to `/login` instead of repeating auth checks in each page.
67. **Loading skeleton screens** – Replace spinner with skeleton loaders for transcript list and form load states.
68. **Form error display** – Show field-level validation errors inline beneath each input rather than a generic message at the top.
69. **Confirm-password field** – Add a "Confirm Password" field to the registration form.
70. **Password visibility toggle** – Add a show/hide password toggle button to login and register forms.
71. **Auto-logout on token expiry** – Detect a `401` response anywhere in the app and automatically redirect to login with a notification.
72. **Persistent auth state** – Restore session from `localStorage` on page reload so the user is not logged out on refresh.
73. **Transcript form field labels** – All form inputs should have accessible `<label>` elements pointing to their input via `htmlFor`.
74. **Character counter** – Show remaining character count for text areas (school name, address, notes).
75. **Date picker component** – Replace raw `<input type="date">` with a styled accessible date picker.
76. **Confirmation dialog** – Show a "Are you sure?" modal before deleting a transcript or course.
77. **Empty state illustrations** – Show a friendly illustration and CTA when a user has no transcripts yet.
78. **Infinite scroll or paginated list** – Implement paginated navigation for users with many transcripts.
79. **Search and filter in TranscriptList** – Add a search box and type/date filters above the transcript list.
80. **Sort by column** – Allow sorting the transcript list by date created, GPA, type.
81. **Print preview** – Add a print-preview modal that renders the transcript HTML before PDF generation.
82. **Download feedback** – Show a progress/spinner during PDF generation so users know it is working.
83. **Duplicate transcript** – Add a "Duplicate" button to quickly create a new transcript from an existing one.
84. **Bulk delete** – Add checkbox selection and a bulk-delete action to TranscriptList.
85. **Responsive table** – Make the course table responsive on mobile (horizontal scroll or card layout).
86. **Course reordering** – Allow drag-and-drop reordering of courses in the transcript form.
87. **Unsaved changes warning** – Warn the user via `beforeunload` if they navigate away from a transcript with unsaved changes.
88. **Toast notification system** – Replace inline `setMessage` state with a global toast/snackbar notification system.
89. **Error boundary** – Add a React `ErrorBoundary` component to catch rendering errors and show a helpful fallback UI.
90. **React.memo and useMemo** – Memoize expensive child components (course rows, GPA display) to reduce unnecessary re-renders.
91. **Lazy-load pages** – Use `React.lazy` + `Suspense` to code-split each page route and reduce the initial bundle size.
92. **Bundle size analysis** – Run `source-map-explorer` and eliminate unused dependencies inflating the JS bundle.
93. **Favicon and meta tags** – Replace the default CRA favicon with a branded icon; add `<meta description>` and Open Graph tags.
94. **Page titles** – Set distinct `<title>` tags for each route using `react-helmet` or `document.title` in a `useEffect`.
95. **Accessibility audit** – Run `axe-core` or Lighthouse and fix all critical and serious accessibility violations.

---

## 🎨 UI / UX Design (Items 96–115)

96. **Design system tokens** – Replace hard-coded hex values in CSS with CSS custom properties (`--color-primary`, `--spacing-md`, etc.).
97. **Consistent typography scale** – Define a typography scale (`h1`–`h6`, `body`, `caption`) and apply it site-wide.
98. **Button variants** – Implement `primary`, `secondary`, `danger`, and `ghost` button variants with a single `<Button>` component.
99. **Input component** – Build a reusable `<Input>` component with label, error state, and helper text built in.
100. **Card component** – Extract the repeated card-style containers into a reusable `<Card>` component.
101. **Consistent spacing** – Audit all margin/padding values; align to an 8px grid.
102. **Focus ring styles** – Ensure all interactive elements have a visible `:focus-visible` outline that meets WCAG contrast.
103. **Hover/active states** – Add consistent hover and active states to all buttons and links.
104. **Mobile navigation** – Implement a hamburger menu for the header on narrow viewports.
105. **Dark mode persistence** – Save dark-mode preference to `localStorage` so it persists across sessions.
106. **Transition animations** – Add subtle CSS transitions for page changes and modal open/close.
107. **Brand logo** – Replace text-based header with an actual SVG/PNG logo.
108. **Hero section polish** – Add a gradient or illustration to the HomePage hero for visual impact.
109. **Feature cards on HomePage** – Display the app's three key features (Generate, Store, Download) as styled cards with icons.
110. **Footer links** – Populate the footer with links to About, Contact, Privacy Policy, and Terms.
111. **Privacy policy page** – Create a `/privacy` page with a basic privacy policy.
112. **Terms of service page** – Create a `/terms` page with terms of service.
113. **Loading state for the whole page** – Show a top-of-page progress bar (e.g., `nprogress`) during route transitions.
114. **Form layout improvements** – Use a two-column grid layout for the transcript form on desktop to reduce scrolling.
115. **Colour contrast** – Audit all text/background combinations for WCAG AA 4.5:1 contrast ratio.

---

## ✅ Testing (Items 116–135)

116. **Test coverage target** – Set a minimum coverage threshold (e.g., 80%) in `jest.config.js` that fails the build if not met.
117. **Unit tests for GPA calculator** – Expand `GPACalculator.test.js` with edge cases: no courses, all F grades, mixed pass/fail.
118. **Unit tests for auth controller** – Test register, login, profile, and logout with mocked DB calls.
119. **Unit tests for transcript controller** – Test CRUD operations, PDF generation error path.
120. **Unit tests for authMiddleware** – Test missing token, expired token, malformed token cases.
121. **Unit tests for dataValidator** – Test all validation rules in `server/utils/dataValidator.js`.
122. **Integration tests for auth routes** – Use Supertest to test the full register → login → profile flow with a real test DB.
123. **Integration tests for transcript routes** – Test CRUD, pagination, and PDF download with test DB.
124. **E2E tests** – Expand the Playwright `tests/e2e/basic.spec.js` to cover login, create transcript, download PDF flows.
125. **Snapshot tests** – Add snapshot tests for key React components (Header, Footer, HomePage).
126. **Test for 404 route** – Assert that unknown routes return a 404 JSON response from the API and render `<NotFoundPage>` on the client.
127. **Test for rate limiter** – Write an integration test that verifies the auth rate limiter triggers after N requests.
128. **Mock external services** – Mock `puppeteer` (PDF generation) in tests to avoid heavy browser overhead.
129. **CI test parallelism** – Split server and client tests into separate CI jobs and run them in parallel.
130. **Test fixtures** – Create reusable test fixtures (user, transcript, courses) in a `tests/fixtures/` directory.
131. **Contract tests** – Add Pact or similar consumer-driven contract tests between the React client and Express API.
132. **Accessibility tests** – Add `jest-axe` to React component tests to catch accessibility regressions automatically.
133. **Visual regression tests** – Add Percy or Chromatic to detect unintended UI changes in CI.
134. **Performance tests** – Add k6 or Artillery load tests for the PDF generation and transcript creation endpoints.
135. **Test environment variables** – Create a `.env.test` file and document required test configuration.

---

## 📦 DevOps & Deployment (Items 136–155)

136. **Docker multi-stage build** – Optimise `Dockerfile` with a multi-stage build (build stage + slim runtime stage) to reduce image size.
137. **docker-compose for development** – Expand `docker-compose.yml` to include hot-reload for both server and client.
138. **docker-compose for production** – Add a `docker-compose.prod.yml` with Nginx reverse proxy, SSL termination, and PostgreSQL with volume.
139. **Health check in Docker** – Add a `HEALTHCHECK` instruction to the `Dockerfile` so Docker knows when the container is ready.
140. **CI caching** – Cache `node_modules` in GitHub Actions using `actions/cache` to speed up CI runs.
141. **Lint step in CI** – Change the `lint-and-format` CI job from `continue-on-error: true` to a hard failure so lint errors block the PR.
142. **Semantic versioning** – Add `semantic-release` or manual changelog-based version bumps and tagging.
143. **Release GitHub Action** – Create a `.github/workflows/release.yml` that builds and pushes a Docker image on version tags.
144. **Environment promotion** – Document the dev → staging → production promotion process.
145. **Secrets management** – Document use of GitHub Secrets / Vault for all required env vars.
146. **Database migration in CI** – Run all `database/*.sql` files (in order) during the CI `test-backend` job setup.
147. **Rollback strategy** – Document how to roll back a bad deployment (DB migration reversal + image tag pinning).
148. **Uptime monitoring** – Integrate an uptime monitor (e.g., UptimeRobot, Better Uptime) and document alert recipients.
149. **Log aggregation** – Ship server logs to a central service (Datadog, Logtail, or ELK) in production.
150. **Structured health endpoint** – Extend `GET /api/health` to return DB latency, version, and uptime metrics in the JSON response.
151. **Static asset CDN** – Serve `client/build/` static assets from a CDN (e.g., CloudFront) rather than directly from the server.
152. **Gzip / Brotli compression** – Enable `compression` middleware in Express (or at the Nginx layer) for all responses.
153. **Process manager** – Use `pm2` (or the Docker restart policy) instead of running Node directly for crash recovery.
154. **Node.js version pinning** – Add an `.nvmrc` / `engines` field in `package.json` to pin the required Node.js version.
155. **Dependency update automation** – Enable Dependabot or Renovate Bot to open PRs for outdated dependencies.

---

## 📄 PDF Generation (Items 156–165)

156. **Puppeteer timeout configuration** – Make the Puppeteer launch timeout and navigation timeout configurable via env vars.
157. **PDF queue** – Move PDF generation to a Bull/BullMQ background queue so the HTTP request returns immediately with a job ID.
158. **PDF download via signed URL** – Store generated PDFs in S3 and return a pre-signed URL for download rather than streaming from the server.
159. **PDF template caching** – Cache the compiled Handlebars/EJS template in memory to avoid re-parsing on every request.
160. **PDF metadata** – Set PDF `author`, `title`, `subject`, and `creator` metadata fields in the generated document.
161. **PDF accessibility** – Generate tagged PDF (PDF/UA) so screen readers can parse the content.
162. **HTML template for transcript** – Extract the PDF HTML into a proper `views/transcript.html` template file instead of building it inline.
163. **College vs high-school template difference** – Ensure the PDF layout visually distinguishes the two transcript types (different headers, field sets).
164. **Page numbers** – Add "Page X of Y" to multi-page transcripts in the PDF footer.
165. **Digital signature** – Optionally embed a digital signature in the PDF using a registrar certificate.

---

## 📬 Email & Notifications (Items 166–172)

166. **Transactional email templates** – Create HTML email templates (using `mjml` or `handlebars`) for welcome, email-verification, and password-reset emails.
167. **Password reset flow** – Implement a `/api/auth/forgot-password` → `/api/auth/reset-password` flow with a time-limited token.
168. **Email service abstraction** – Abstract `emailService.js` behind an interface so the underlying provider (Nodemailer, SendGrid, Postmark) can be swapped without touching business logic.
169. **Email retry on failure** – Queue failed email sends for retry with exponential back-off.
170. **Notification preferences** – Allow users to opt in/out of email notifications (e.g., PDF ready, transcript shared).
171. **Transcript share via email** – Add a "Share via Email" feature that sends the PDF as an attachment or a signed download link.
172. **Admin notification** – Notify an admin email address when a new user registers or an error rate threshold is exceeded.

---

## 🔍 Observability & Analytics (Items 173–180)

173. **Application performance monitoring** – Integrate an APM tool (Datadog APM, New Relic, or OpenTelemetry) to trace slow endpoints.
174. **Error tracking** – Add Sentry (or similar) for automatic error capture and alerting in production.
175. **Business metrics dashboard** – Track and display admin-visible metrics: total users, transcripts generated per day, PDF download rate.
176. **API response time logging** – Log request duration in the Morgan format or as a custom log field.
177. **Slow query logging** – Log any DB query exceeding 200 ms so performance regressions are visible.
178. **Real user monitoring (RUM)** – Add a lightweight RUM snippet to the React app to track page load times and JS errors.
179. **Feature flag analytics** – Track which generation toggle flags are enabled and correlate with usage patterns.
180. **Export usage report** – Allow admins to export a CSV of user activity and generated transcripts.

---

## 📖 Documentation (Items 181–190)

181. **README quickstart** – Shorten `README.md` to a concise 5-step quickstart; link to `ARCHITECTURE.md` for detail.
182. **API documentation** – Update `API.md` to cover all routes including `/api/academic`, `/api/generator`, and `/api/design`.
183. **Architecture diagram** – Add an ASCII or Mermaid diagram to `ARCHITECTURE.md` showing the client → server → DB → PDF flow.
184. **Contributing guide completeness** – Add a branch naming convention, commit message format, and PR checklist to `CONTRIBUTING.md`.
185. **Environment variable reference** – Create a table in `DEPLOYMENT.md` listing every required and optional env var with defaults and descriptions.
186. **Code comments on complex logic** – Add JSDoc comments to GPA calculation logic, PDF template building, and seal generation utilities.
187. **Changelog** – Create a `CHANGELOG.md` following Keep a Changelog format.
188. **Database schema diagram** – Add an ERD (Entity-Relationship Diagram) to the `database/` directory or `ARCHITECTURE.md`.
189. **Onboarding guide** – Write a `DEVELOPMENT.md` guide covering local setup, running tests, and making a first contribution.
190. **Storybook** – Add Storybook to document and visually test reusable UI components (`Button`, `Input`, `Card`, etc.).

---

## 🚀 Feature Completeness (Items 191–200)

191. **User profile page** – Build a `/profile` page where users can update their username, email, and password.
192. **Multi-institution support** – Allow one user to manage transcripts for multiple institutions (school/university profiles).
193. **Transcript templates** – Provide 3–5 visual transcript layout templates that users can choose between.
194. **GPA scale selection** – Let users choose between 4.0, 5.0, and 100-point GPA scales.
195. **Course import from CSV** – Allow users to bulk-import courses from a CSV file.
196. **Transcript sharing / public link** – Generate a time-limited public read-only link to share a transcript with a third party.
197. **Admin panel** – Build a simple admin dashboard (user list, usage stats, ban/unban) protected by an admin role.
198. **Seal management UI** – Create a polished UI page for uploading, previewing, and selecting institutional seals.
199. **Internationalisation (i18n)** – Add `react-i18next` and extract all UI strings to translation files; provide at least English and one other language.
200. **Offline support / PWA** – Add a `service-worker` manifest so the app is installable as a PWA and can show cached data offline.
