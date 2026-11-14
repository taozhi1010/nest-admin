#!/usr/bin/env bash
# 一键启动前端、后端和文档开发服务（用法：bash bin/dev.sh）
# - 启动前释放 5173 / 8080 / 8888 端口
# - 前端先静默启动（不弹浏览器），后端就绪后再打开页面，避免首屏 502
# - 文档通过前端 8888 的 /manual/ 代理访问（VitePress 5173）
# - Ctrl+C 同时停止所有服务

# 由 cmd/WSL 直接拉起 Git Bash 时不会加载 /etc/profile，PATH 里可能没有 coreutils
for d in /usr/bin /bin /mingw64/bin; do
  case ":$PATH:" in
    *":$d:"*) ;;
    *) [ -d "$d" ] && PATH="$d:$PATH" ;;
  esac
done
export PATH

SCRIPT_DIR=$(cd "$(dirname "$0")" && pwd) || exit 1
ROOT_DIR=$(cd "$SCRIPT_DIR/.." && pwd) || exit 1

# cmd 里的 bash 常解析到 WSL：自动转交给 Windows 侧 Git Bash
if [ -r /proc/version ] && grep -qi microsoft /proc/version; then
  win_bash=""
  for cand in \
    "/mnt/c/Program Files/Git/bin/bash.exe" \
    "/mnt/c/Program Files (x86)/Git/bin/bash.exe"; do
    if [ -x "$cand" ]; then win_bash=$cand; break; fi
  done
  if [ -z "$win_bash" ] && command -v cmd.exe >/dev/null 2>&1; then
    win_profile=$(cmd.exe /c echo %USERPROFILE% 2>/dev/null | tr -d '\r')
    cand=$(wslpath -u "$win_profile" 2>/dev/null)/AppData/Local/Programs/Git/bin/bash.exe
    [ -x "$cand" ] && win_bash=$cand
  fi
  if [ -n "$win_bash" ]; then
    echo "检测到 WSL，已转交给 Windows 的 Git Bash 启动…"
    exec "$win_bash" "$(wslpath -m "$SCRIPT_DIR/dev.sh")" "$@"
  fi
  echo "当前运行在 WSL 的 bash 中，且未找到 Windows 的 Git Bash。" >&2
  echo "请安装 Git for Windows 后重试。" >&2
  exit 1
fi

cd "$ROOT_DIR" || exit 1

FRONT_URL="http://localhost:8888"
BACK_PROBE="http://127.0.0.1:8080/"
FRONT_PROBE="http://127.0.0.1:8888/"
# VitePress 只监听 localhost(::1)，用 127.0.0.1 探测会一直失败
DOCS_PROBE="http://localhost:5173/manual/"
BACK_TIMEOUT=120
FRONT_TIMEOUT=30

# 从 cmd 启动时 PATH 可能不含 Node，先按常见安装位置补上
ensure_node() {
  command -v node >/dev/null 2>&1 && return 0
  local d
  for d in \
    "/c/Program Files/Volta" \
    "/c/Program Files/nodejs" \
    "/d/nodejs" \
    "$HOME/AppData/Local/Volta/bin" \
    /d/nvm/v* \
    "$HOME/AppData/Roaming/nvm/v*"; do
    if [ -x "$d/node.exe" ]; then
      export PATH="$d:$PATH"
      echo "已自动找到 Node：$d"
      return 0
    fi
  done
  return 1
}

if ! ensure_node; then
  echo "未找到 node，请安装 Node.js 或将其所在目录加入 PATH 后重试。" >&2
  exit 1
fi

if command -v pnpm >/dev/null 2>&1 && pnpm --version >/dev/null 2>&1; then
  PM=pnpm
elif npm --version >/dev/null 2>&1; then
  PM=npm
  echo "pnpm 不可用，改用 npm 启动"
else
  echo "未找到可用的 pnpm/npm，请检查 Node.js 安装。" >&2
  exit 1
fi
echo "包管理器：$PM（Node $(node -v)）"

start_pkg() {
  local dir=$1
  shift
  if [ "$PM" = pnpm ]; then
    pnpm -C "$dir" run "$@"
  else
    npm --prefix "$dir" run "$@"
  fi
}

free_port() {
  node "$ROOT_DIR/scripts/free-port.mjs" "$1"
}

wait_http() {
  local url=$1
  local timeout=$2
  local i=0
  while [ "$i" -lt "$((timeout * 2))" ]; do
    if curl -s --max-time 2 "$url" >/dev/null 2>&1; then
      return 0
    fi
    sleep 0.5
    i=$((i + 1))
  done
  return 1
}

open_url() {
  local url=$1
  if command -v cmd >/dev/null 2>&1; then
    cmd //c start "" "$url" >/dev/null 2>&1
  elif command -v open >/dev/null 2>&1; then
    open "$url"
  elif command -v xdg-open >/dev/null 2>&1; then
    xdg-open "$url" >/dev/null 2>&1
  else
    echo "请手动打开 $url"
  fi
}

trap 'kill 0' EXIT INT TERM

# 先确保端口空闲，否则就绪探测会命中即将被关闭的旧实例
free_port 5173 || exit 1
free_port 8080 || exit 1
free_port 8888 || exit 1

start_pkg docs dev &
start_pkg server start:dev:clean &
BROWSER=none start_pkg admin-vue3 dev:clean &

if ! command -v curl >/dev/null 2>&1; then
  echo "未找到 curl，无法检测就绪，请手动打开 $FRONT_URL"
  wait
  exit 0
fi

echo "等待后端就绪…"
if ! wait_http "$BACK_PROBE" "$BACK_TIMEOUT"; then
  echo "后端 ${BACK_TIMEOUT}s 内未就绪，未自动打开页面，请查看上方日志" >&2
  wait
  exit 1
fi
echo "后端已就绪"

if ! wait_http "$FRONT_PROBE" "$FRONT_TIMEOUT"; then
  echo "前端 ${FRONT_TIMEOUT}s 内未就绪，未自动打开页面，请查看上方日志" >&2
  wait
  exit 1
fi
echo "前端已就绪"

if ! wait_http "$DOCS_PROBE" "$FRONT_TIMEOUT"; then
  echo "文档服务 ${FRONT_TIMEOUT}s 内未就绪，首页文档入口可能不可用，请查看上方日志" >&2
fi

open_url "$FRONT_URL"
echo "按 Ctrl+C 停止所有服务"

wait
