#!/bin/bash
# Automated Database Migration Script
set -e

DB_NAME="${DB_NAME:-transcript_generator}"
DB_USER="${DB_USER:-postgres}"
DB_HOST="${DB_HOST:-localhost}"
MIGRATIONS_DIR="./database/migrations"

mkdir -p "$MIGRATIONS_DIR"

apply_migrations() {
    echo "Applying migrations..."
    for migration_file in "$MIGRATIONS_DIR"/*.sql; do
        if [ -f "$migration_file" ]; then
            echo "Applying: $(basename $migration_file)"
            PGPASSWORD=$DB_PASSWORD psql -h "$DB_HOST" -U "$DB_USER" -d "$DB_NAME" -f "$migration_file"
        fi
    done
    echo "Migrations completed"
}

case "${1:-}" in
    up) apply_migrations ;;
    *) echo "Usage: $0 {up}"; exit 1 ;;
esac
