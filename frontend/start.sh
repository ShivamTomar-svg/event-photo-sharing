#!/bin/sh
set -e

PORT="${PORT:-3000}"
echo "==> Momento Web: Starting static server on port $PORT"
exec npx serve -s dist -l "$PORT"
