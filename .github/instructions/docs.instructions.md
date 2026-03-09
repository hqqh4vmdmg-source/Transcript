---
applyTo: "*.md,docs/**"
---

# Documentation Instructions

## Overview
Repository documentation lives at the root level as Markdown files. Each file has a specific purpose.

## Documentation Files
| File | Purpose | Update when... |
|---|---|---|
| `README.md` | Project overview, features, installation, usage | Changing features, setup, or getting started steps |
| `API.md` | REST API endpoint documentation (40+ endpoints) | Adding, modifying, or removing API endpoints |
| `ARCHITECTURE.md` | System architecture, data flows, component hierarchy | Changing system boundaries, adding services, or modifying data flow |
| `CONTRIBUTING.md` | Contribution guidelines, development process | Changing development workflow, PR process, or code style rules |
| `DEPLOYMENT.md` | AWS deployment guide, Docker setup, SSL, monitoring | Changing deployment configuration or adding deployment targets |
| `SECURITY.md` | Security policy, vulnerability reporting | Changing security practices or contact information |
| `QUICKSTART.md` | Quick setup guide with prerequisites | Changing prerequisites, install steps, or first-run experience |
| `ENHANCEMENTS.md` | Enhancement tracking (200 items across categories) | Completing or adding enhancement items |

## Writing Style
- Use clear, imperative language.
- Use Markdown headers for structure (##, ###).
- Use code blocks with language tags for commands and code snippets.
- Use tables for structured data (endpoints, configuration).
- Keep lines under 100 characters where practical.
- Use relative links for cross-referencing repo files.

## API Documentation (`API.md`)
- Document every public endpoint with: HTTP method, path, description, request body, response body, status codes.
- Group endpoints by resource (Auth, Transcripts, Seals, Generator, Certificates, Design, Academic).
- Include example request/response JSON.
- Note authentication requirements (which endpoints need Bearer token).

## When to Update Documentation
- **New API endpoint** → Update `API.md` with endpoint details.
- **New feature** → Update `README.md` features list and relevant architecture docs.
- **Changed setup** → Update `README.md`, `QUICKSTART.md`, and `.github/copilot-instructions.md`.
- **Changed deployment** → Update `DEPLOYMENT.md`.
- **Security change** → Update `SECURITY.md`.
- **Architecture change** → Update `ARCHITECTURE.md`.
- **Enhancement completed** → Mark as done in `ENHANCEMENTS.md`.

## Formatting Conventions
- Use `bash` language tag for shell commands.
- Use `javascript` or `js` for JavaScript code.
- Use `sql` for SQL queries.
- Use `json` for JSON examples.
- Use backticks for inline code, file names, and variable names.
- Use bold for emphasis on important terms.

## Anti-Patterns
- Do not add documentation for features that don't exist yet.
- Do not duplicate the same information across multiple docs — cross-reference instead.
- Do not include secrets, credentials, or real user data in examples.
- Do not leave placeholder text (e.g., "TODO", "TBD") without a clear follow-up plan.
