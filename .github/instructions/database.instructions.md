---
applyTo: "database/**"
---

# Database Instructions

## Overview
The `database/` directory contains PostgreSQL schema files that define the application's data model. These files are executed during database initialization and CI setup.

## Schema Files (10 files)
```
database/
├── schema.sql                          # Core tables: users, transcripts, courses + triggers
├── seal_schema.sql                     # Seal-related tables
├── certificate_schema.sql              # Certificate tables
├── certificate_enhancements_schema.sql # Certificate enhancement tables
├── design_system_schema.sql            # Theme and design system tables
├── enhanced_transcript_schema.sql      # Enhanced transcript features
├── gpa_categories_schema.sql           # GPA category tables
├── performance_schema.sql              # Performance tracking tables
├── transcript_enhancements_schema.sql  # Transcript enhancement tables
└── api_backend_schema.sql              # API backend service tables
```

## Initialization Order
Docker-compose mounts the core schemas as ordered init files:
1. `schema.sql` → `/docker-entrypoint-initdb.d/01-schema.sql`
2. `seal_schema.sql` → `/docker-entrypoint-initdb.d/02-seal_schema.sql`

CI also runs these two files before tests:
```bash
psql -f database/schema.sql
psql -f database/seal_schema.sql
```

Other schema files may be run independently or as part of migration scripts.

## Schema Conventions
- Use `CREATE TABLE IF NOT EXISTS` to make scripts idempotent.
- Use `CREATE INDEX IF NOT EXISTS` for indexes.
- Use `SERIAL PRIMARY KEY` for auto-incrementing integer primary keys.
- Use `TIMESTAMP DEFAULT CURRENT_TIMESTAMP` for `created_at` / `updated_at` columns.
- Use `ON DELETE CASCADE` on foreign keys where child records should be removed with parent.
- Use `JSONB` for flexible data storage (e.g., transcript `data` column).
- Use `VARCHAR(n)` with appropriate length constraints.

## Triggers
- The `update_updated_at_column()` trigger function automatically updates `updated_at` on row modification.
- Apply this trigger to tables that have an `updated_at` column.

## Naming Conventions
- Table names: lowercase, plural, snake_case (e.g., `users`, `transcripts`, `courses`).
- Column names: lowercase, snake_case (e.g., `user_id`, `created_at`, `password_hash`).
- Index names: `idx_{table}_{column}` (e.g., `idx_transcripts_user_id`).
- Trigger names: `update_{table}_updated_at`.
- Foreign key columns: `{referenced_table_singular}_id` (e.g., `user_id`, `transcript_id`).

## Testing Considerations
- Server tests require both `schema.sql` and `seal_schema.sql` to be loaded.
- CI uses a separate test database (`transcript_generator_test`).
- Schema changes must be backward-compatible or accompanied by migration scripts.

## Validation
- After modifying schema files, verify they execute successfully:
  ```bash
  PGPASSWORD=postgres psql -h localhost -U postgres -d transcript_generator -f database/<file>.sql
  ```
- Run server tests to ensure models still work: `cd server && npm test`

## Anti-Patterns
- Do not use `DROP TABLE` without `IF EXISTS` — may break idempotent execution.
- Do not change column types or remove columns without a migration strategy.
- Do not add tables without corresponding indexes on foreign key columns.
- Do not use `TEXT` where `VARCHAR(n)` with a length limit is more appropriate.
- Do not skip the `updated_at` trigger on tables that have `updated_at` columns.
