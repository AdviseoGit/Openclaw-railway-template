#!/usr/bin/env bash
set -e

WORKSPACE="${OPENCLAW_WORKSPACE_DIR:-/data/workspace}"

if [ -d /app/seed-workspace ]; then
  echo "[seed] Seeding workspace (preserving existing files)"
  mkdir -p "$WORKSPACE"
  # -n = no-clobber: never overwrite files already on the volume
  cp -rn /app/seed-workspace/. "$WORKSPACE/"

  # Always keep these files current with the deployed repo
  cp -f /app/seed-workspace/funbutler_rebuild.js "$WORKSPACE/funbutler_rebuild.js" 2>/dev/null || true
  cp -f /app/seed-workspace/SOUL.md "$WORKSPACE/SOUL.md" 2>/dev/null || true
  cp -f /app/seed-workspace/AGENTS.md "$WORKSPACE/AGENTS.md" 2>/dev/null || true
  cp -f /app/seed-workspace/TOOLS.md "$WORKSPACE/TOOLS.md" 2>/dev/null || true

  echo "[seed] Done"
fi

exec node /app/src/server.js
