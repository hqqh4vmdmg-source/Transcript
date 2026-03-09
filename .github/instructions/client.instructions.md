---
applyTo: "client/**"
---

# Client Instructions

## Overview
The `client/` directory contains the React 19 frontend, bootstrapped with Create React App. Uses ES module syntax (`import`/`export`).

## Directory Layout
```
client/
├── public/                 # Static assets, index.html
├── src/
│   ├── App.js / App.css    # Root component with routing
│   ├── index.js            # Entry point
│   ├── components/         # Reusable UI components
│   ├── context/            # React Context providers (AuthContext.js)
│   ├── pages/              # Route-level page components
│   ├── services/           # API service layer (axios wrappers)
│   ├── utils/              # Utility functions (GPACalculator.js)
│   └── __tests__/          # Unit tests
├── Dockerfile.dev          # Dev container config
└── package.json            # Dependencies and CRA scripts
```

## Component Patterns
- Use **functional components** with hooks exclusively. No class components.
- State management: `useState`, `useReducer` for local state; React Context (`AuthContext`) for auth state.
- Co-locate CSS files with their components (e.g., `Header.js` + `Header.css`).
- Pages go in `src/pages/`, reusable components go in `src/components/`.

## API Communication
- All API calls go through **service files** in `src/services/`:
  - `authService.js` — login, register, profile
  - `transcriptService.js` — transcript CRUD
  - `academicService.js` — 64 academic feature endpoints
- **Never** make direct `axios` calls from components — always use the service layer.
- Service methods accept a `token` parameter and set the `Authorization: Bearer ${token}` header.
- The development proxy (`"proxy": "http://localhost:5000"` in `package.json`) forwards API requests to the backend.

## Routing
- React Router v7 with future flags (`v7_startTransition`, `v7_relativeSplatPath`).
- Routes defined in `App.js` using `<Routes>` and `<Route>` components.
- Current routes: `/`, `/login`, `/register`, `/transcript`, `/transcript/high-school`, `/transcript/college`, `/transcripts`, `/transcripts/edit/:id`, `/profile`, `/about`, `/contact`, `*` (404).

## Auth Pattern
- `AuthContext.js` provides: `user`, `token`, `loading`, `login`, `register`, `logout`, `refreshUser`, `isAuthenticated`.
- Token stored in `localStorage`. Checked on mount via `authService.getProfile()`.
- Use `useAuth()` hook to access auth state in components.

## Styling
- Plain CSS with co-located stylesheets.
- No CSS-in-JS or utility-first frameworks.
- Each component/page has a matching `.css` file.

## Testing
- React Testing Library (via CRA's built-in Jest setup).
- Test files in `src/__tests__/` matching `*.test.js` pattern.
- Run tests: `cd client && CI=true npm test -- --watchAll=false`
- Coverage: `cd client && CI=true npm test -- --coverage --watchAll=false`

## Build
- Production build: `cd client && CI=true npm run build`
- Build must produce **zero warnings** (CI treats warnings as errors).
- Output goes to `client/build/` (gitignored).

## Validation Before Push
```bash
cd client && CI=true npm test -- --watchAll=false   # Tests must pass
cd client && CI=true npm run build                   # Build must succeed with no warnings
```

## ESLint
- Uses `react-app` preset (configured in `package.json` `eslintConfig` field).
- Fix unused imports and variables before committing.

## Anti-Patterns
- Do not use class components — always use functional components with hooks.
- Do not make direct `axios.get`/`axios.post` calls from components — use service files.
- Do not store sensitive data in `localStorage` beyond the JWT token.
- Do not hardcode API URLs — use the proxy or environment variables.
- Do not import server-side code or CommonJS modules in client files.
- Do not suppress build warnings with `// eslint-disable` without justification.
- Do not add new dependencies without checking for bundle size impact.
