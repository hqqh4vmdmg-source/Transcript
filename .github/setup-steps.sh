#!/bin/bash
# Copilot Coding Agent Setup Steps
# This script prepares the ephemeral environment for Copilot coding agent.
# It installs dependencies and validates the setup without requiring a database.

set -e

echo "=== Copilot Coding Agent Environment Setup ==="

# Install server dependencies (skip Puppeteer download in sandboxed env)
echo "Installing server dependencies..."
cd server && PUPPETEER_SKIP_DOWNLOAD=true npm install
cd ..

# Install client dependencies
echo "Installing client dependencies..."
cd client && npm install
cd ..

# Copy .env.example if .env doesn't exist
if [ ! -f server/.env ]; then
  echo "Creating server/.env from .env.example..."
  cp server/.env.example server/.env
fi

# Verify server can load without database
echo "Running server smoke check..."
cd server && node -e "require('./app')" && echo "Server smoke check passed"
cd ..

echo "=== Setup Complete ==="
