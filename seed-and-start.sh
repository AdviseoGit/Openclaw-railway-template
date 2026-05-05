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
  cp -f /app/seed-workspace/HEARTBEAT.md "$WORKSPACE/HEARTBEAT.md" 2>/dev/null || true

  # Always keep skill scripts current (state/ is excluded — preserved on volume)
  SKILL_DST="$WORKSPACE/skills/starkaraoke-monitor"
  SKILL_SRC="/app/seed-workspace/skills/starkaraoke-monitor"
  mkdir -p "$SKILL_DST/scripts" "$SKILL_DST/state"
  cp -f "$SKILL_SRC/SKILL.md" "$SKILL_DST/SKILL.md" 2>/dev/null || true
  cp -f "$SKILL_SRC/INSTALL.md" "$SKILL_DST/INSTALL.md" 2>/dev/null || true
  cp -f "$SKILL_SRC/scripts/"*.js "$SKILL_DST/scripts/" 2>/dev/null || true

  echo "[seed] Done"
fi

exec node /app/src/server.js
