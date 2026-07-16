#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
PORT="${CODEX_DEBUG_PORT:-9341}"
APP="${CODEX_APP:-/Applications/ChatGPT.app}"
NODE_BIN="$APP/Contents/Resources/cua_node/bin/node"
[[ -x "$NODE_BIN" ]] || { echo "找不到 Codex 内置 Node.js。"; exit 1; }
if [[ -f "$ROOT/.runtime/state.json" ]]; then
  PORT="$($NODE_BIN -e 'process.stdout.write(String(JSON.parse(require("node:fs").readFileSync(process.argv[1],"utf8")).port||process.argv[2]))' "$ROOT/.runtime/state.json" "$PORT")"
fi
cd "$ROOT"
exec "$NODE_BIN" src/injector.mjs --port "$PORT" --remove --once
