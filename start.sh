#!/bin/bash
# start.sh — Full setup and start script
# Installs dependencies, configures environment, initialises the database,
# and launches both the server and client in one command.
set -e

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "=== Transcript Generator — Full Setup & Start ==="

# ── 1. Install dependencies ──────────────────────────────────────────────────
echo ""
echo "[1/6] Installing dependencies..."
cd "$REPO_ROOT"
npm install

echo "  Installing server dependencies..."
cd "$REPO_ROOT/server"
PUPPETEER_SKIP_DOWNLOAD=true npm install

echo "  Installing client dependencies..."
cd "$REPO_ROOT/client"
npm install

# ── 2. Environment file ───────────────────────────────────────────────────────
echo ""
echo "[2/6] Configuring environment..."
cd "$REPO_ROOT"
if [ ! -f "server/.env" ]; then
  cp server/.env.example server/.env
  echo "  Created server/.env from .env.example — review and update credentials before production use."
else
  echo "  server/.env already exists, skipping."
fi

# Load env vars so subsequent psql/createdb calls can use them
set -a
# shellcheck disable=SC1091
source server/.env 2>/dev/null || true
set +a

DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-5432}"
DB_NAME="${DB_NAME:-transcript_generator}"
DB_USER="${DB_USER:-postgres}"

# ── 3. Create database ────────────────────────────────────────────────────────
echo ""
echo "[3/6] Checking database..."
if PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -lqt 2>/dev/null \
    | cut -d '|' -f 1 | grep -qw "$DB_NAME"; then
  echo "  Database '$DB_NAME' already exists, skipping creation."
else
  echo "  Creating database '$DB_NAME'..."
  PGPASSWORD="$DB_PASSWORD" createdb -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" "$DB_NAME"
fi

# ── 4. Load all schema files ──────────────────────────────────────────────────
echo ""
echo "[4/6] Loading database schemas..."

run_schema() {
  local file="$1"
  echo "  $(basename "$file")"
  PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" \
    -d "$DB_NAME" -f "$file" -q
}

# Load in dependency order: core tables first, then extensions/alterations
run_schema "$REPO_ROOT/database/schema.sql"
run_schema "$REPO_ROOT/database/seal_schema.sql"
run_schema "$REPO_ROOT/database/certificate_schema.sql"
run_schema "$REPO_ROOT/database/certificate_enhancements_schema.sql"
run_schema "$REPO_ROOT/database/design_system_schema.sql"
run_schema "$REPO_ROOT/database/enhanced_transcript_schema.sql"
run_schema "$REPO_ROOT/database/gpa_categories_schema.sql"
run_schema "$REPO_ROOT/database/performance_schema.sql"
run_schema "$REPO_ROOT/database/transcript_enhancements_schema.sql"
run_schema "$REPO_ROOT/database/api_backend_schema.sql"

echo "  All schemas loaded."

# ── 5. Create required runtime directories ────────────────────────────────────
echo ""
echo "[5/6] Creating runtime directories..."
mkdir -p "$REPO_ROOT/server/public/seals"
echo "  server/public/seals — OK"

# ── 6. Start the application ──────────────────────────────────────────────────
echo ""
echo "[6/6] Starting application..."
echo "  Client → http://localhost:3000"
echo "  Server → http://localhost:5000"
echo ""
cd "$REPO_ROOT"
npm run dev
