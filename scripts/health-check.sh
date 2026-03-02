#!/bin/bash
# Health Check Script
set -e

API_URL="${API_URL:-http://localhost:5000}"

echo "=== Health Check ==="
response=$(curl -s "$API_URL/api/health" || echo "FAILED")
echo "API: $response"

PGPASSWORD=$DB_PASSWORD pg_isready -h localhost -U postgres -q && echo "Database: OK" || echo "Database: FAILED"
