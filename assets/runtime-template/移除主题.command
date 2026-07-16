#!/usr/bin/env bash
ROOT="$(cd "$(dirname "$0")" && pwd)"
cd "$ROOT"
bash scripts/remove-theme.sh
STATUS=$?
if [[ $STATUS -ne 0 ]]; then read -r -p "移除失败，按回车关闭……"; fi
exit "$STATUS"
