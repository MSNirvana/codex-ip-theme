#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd -P)"
PORT="${CODEX_DEBUG_PORT:-9341}"
EXPECTED_TEAM_ID="${CODEX_EXPECTED_TEAM_ID:-2DC432GLL2}"
if [[ -z "${CODEX_DEBUG_PORT:-}" && -f "$ROOT/.runtime/state.json" ]]; then
  SAVED_PORT="$(/usr/bin/plutil -extract port raw -o - "$ROOT/.runtime/state.json" 2>/dev/null || true)"
  [[ "$SAVED_PORT" =~ ^[0-9]+$ ]] && PORT="$SAVED_PORT"
fi

if [[ -n "${CODEX_APP:-}" ]]; then
  APP="$CODEX_APP"
elif [[ -d "/Applications/ChatGPT.app" ]]; then
  APP="/Applications/ChatGPT.app"
elif [[ -d "$HOME/Applications/ChatGPT.app" ]]; then
  APP="$HOME/Applications/ChatGPT.app"
else
  APP="$(/usr/bin/mdfind 'kMDItemCFBundleIdentifier == "com.openai.codex"' | /usr/bin/head -n 1)"
fi

[[ -f "$APP/Contents/Info.plist" ]] || { echo "找不到官方 Codex 应用；可用 CODEX_APP 指定路径。"; exit 1; }
IDENTIFIER="$(/usr/bin/plutil -extract CFBundleIdentifier raw -o - "$APP/Contents/Info.plist" 2>/dev/null || true)"
[[ "$IDENTIFIER" = "com.openai.codex" ]] || { echo "应用标识不是 com.openai.codex：$APP"; exit 1; }
EXECUTABLE_NAME="$(/usr/bin/plutil -extract CFBundleExecutable raw -o - "$APP/Contents/Info.plist")"
CODEX_EXE="$APP/Contents/MacOS/$EXECUTABLE_NAME"
NODE_BIN="$APP/Contents/Resources/cua_node/bin/node"
[[ -x "$CODEX_EXE" && -x "$NODE_BIN" ]] || { echo "Codex 主程序或内置 Node.js 缺失。"; exit 1; }

/usr/bin/codesign --verify --deep --strict "$APP" >/dev/null 2>&1 || { echo "Codex 应用签名验证失败。"; exit 1; }
/usr/bin/codesign --verify --strict "$NODE_BIN" >/dev/null 2>&1 || { echo "Codex 内置 Node.js 签名验证失败。"; exit 1; }
APP_TEAM="$(/usr/bin/codesign -dv --verbose=4 "$APP" 2>&1 | /usr/bin/awk -F= '/^TeamIdentifier=/{print $2; exit}')"
NODE_TEAM="$(/usr/bin/codesign -dv --verbose=4 "$NODE_BIN" 2>&1 | /usr/bin/awk -F= '/^TeamIdentifier=/{print $2; exit}')"
[[ "$APP_TEAM" = "$EXPECTED_TEAM_ID" && "$NODE_TEAM" = "$APP_TEAM" ]] || { echo "Codex/Node 签名团队不匹配。"; exit 1; }
NODE_MAJOR="$($NODE_BIN --version | /usr/bin/sed -E 's/^v([0-9]+).*/\1/')"
[[ "$NODE_MAJOR" -ge 20 ]] || { echo "Codex 内置 Node.js 版本过旧。"; exit 1; }

cdp_ready() { /usr/bin/curl --noproxy '*' -fsS --max-time 1 "http://127.0.0.1:$1/json/version" >/dev/null 2>&1; }
port_busy() { /usr/sbin/lsof -nP -iTCP:"$1" -sTCP:LISTEN -t >/dev/null 2>&1; }

if ! cdp_ready "$PORT"; then
  while port_busy "$PORT" && [[ "$PORT" -lt 9441 ]]; do PORT=$((PORT + 1)); done
  [[ "$PORT" -le 9441 ]] || { echo "9341–9441 没有可用端口。"; exit 1; }
fi

if ! cdp_ready "$PORT"; then
  if pgrep -f "$CODEX_EXE" >/dev/null 2>&1; then
    echo "Codex 已运行但未开放主题端口。请 Command+Q 完全退出后重试。"
    exit 2
  fi
  /usr/bin/open -na "$APP" --args --remote-debugging-address=127.0.0.1 --remote-debugging-port="$PORT"
fi

cd "$ROOT"
/bin/mkdir -p "$ROOT/.runtime"
"$NODE_BIN" -e 'require("node:fs").writeFileSync(process.argv[1], JSON.stringify({port:Number(process.argv[2]),updatedAt:new Date().toISOString()}, null, 2)+"\n")' "$ROOT/.runtime/state.json" "$PORT"
exec "$NODE_BIN" src/injector.mjs --port "$PORT"
