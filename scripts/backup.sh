#!/bin/bash
# Automated Backup Script
set -e

BACKUP_DIR="${BACKUP_DIR:-./backups}"
DB_NAME="${DB_NAME:-transcript_generator}"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

mkdir -p "$BACKUP_DIR"

echo "Creating backup..."
PGPASSWORD=$DB_PASSWORD pg_dump -h localhost -U postgres -d "$DB_NAME" > "$BACKUP_DIR/backup_$TIMESTAMP.sql"
echo "Backup created: $BACKUP_DIR/backup_$TIMESTAMP.sql"
