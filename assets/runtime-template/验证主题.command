#!/usr/bin/env bash
ROOT="$(cd "$(dirname "$0")" && pwd)"
APP="${CODEX_APP:-/Applications/ChatGPT.app}"
NODE_BIN="$APP/Contents/Resources/cua_node/bin/node"
PORT="${CODEX_DEBUG_PORT:-9341}"
SCREENSHOT="$ROOT/theme-verification.png"
if [[ -f "$ROOT/.runtime/state.json" ]]; then
  PORT="$($NODE_BIN -e 'process.stdout.write(String(JSON.parse(require("node:fs").readFileSync(process.argv[1],"utf8")).port||process.argv[2]))' "$ROOT/.runtime/state.json" "$PORT")"
fi
cd "$ROOT"
"$NODE_BIN" src/verify.mjs --port "$PORT" --screenshot "$SCREENSHOT"
STATUS=$?
if [[ $STATUS -eq 0 ]]; then /usr/bin/open "$SCREENSHOT"; else read -r -p "验证失败，按回车关闭……"; fi
exit "$STATUS"
