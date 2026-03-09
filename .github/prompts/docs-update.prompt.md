---
mode: agent
description: "Update documentation to reflect code changes, ensuring accuracy across README, API docs, and architecture docs"
---

# Documentation Update

Update project documentation to reflect recent changes.

## Documentation Inventory

Check each file for accuracy against the current codebase:

| File | Content | Key things to verify |
|---|---|---|
| `README.md` | Overview, features, installation, usage | Feature list, setup steps, dependencies |
| `API.md` | REST API endpoints (40+) | Endpoint paths, methods, request/response shapes, auth requirements |
| `ARCHITECTURE.md` | System architecture and data flows | Service list, component relationships, deployment diagram |
| `CONTRIBUTING.md` | Development workflow | Branch strategy, PR process, code style rules |
| `DEPLOYMENT.md` | Deployment guide | Docker commands, AWS config, environment variables |
| `SECURITY.md` | Security policy | Vulnerability reporting, security measures |
| `QUICKSTART.md` | Getting started guide | Prerequisites, install commands, first-run steps |
| `ENHANCEMENTS.md` | Enhancement tracking | Completion status of 200 enhancement items |
| `.github/copilot-instructions.md` | Copilot guidance | Architecture, commands, conventions |

## Update Process

1. **Identify what changed** — List the code changes that affect documentation.
2. **Map changes to docs** — Determine which documentation files need updates.
3. **Update each file** — Make precise edits that accurately reflect the new state.
4. **Cross-reference** — Ensure consistency across documents (e.g., if `API.md` adds an endpoint, `ARCHITECTURE.md` should reference the new route if significant).
5. **Verify** — Read the updated docs as a new developer would and confirm they are accurate and sufficient.

## Style Guidelines
- Use imperative voice for instructions ("Run the server", not "You should run the server").
- Use code blocks with language tags for all commands and code.
- Use tables for structured data.
- Use relative links for cross-references within the repo.
- Keep lines under 100 characters where practical.
- Include example output where it helps understanding.
