#!/bin/sh
set -eu
cd "$(dirname "$0")"
if command -v python3 >/dev/null 2>&1; then
    exec python3 scripts/serve.py dist
elif command -v node >/dev/null 2>&1; then
    exec node scripts/serve.mjs dist
else
    printf '%s\n' 'Python 3.8+ or Node.js is required to serve the prebuilt site.'
    exit 1
fi
