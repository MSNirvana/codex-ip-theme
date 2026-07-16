#!/usr/bin/env bash
ROOT="$(cd "$(dirname "$0")" && pwd)"
cd "$ROOT"
bash scripts/start-macos.sh
STATUS=$?
if [[ $STATUS -ne 0 ]]; then
  echo
  echo "启动失败（错误码：$STATUS）。"
  read -r -p "按回车关闭窗口……"
fi
exit "$STATUS"
