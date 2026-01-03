#!/bin/bash

set -euo pipefail

SERVER_IP="${SERVER_IP:-101.133.149.17}"
USERNAME="${USERNAME:-root}"
DEPLOY_ROOT="${DEPLOY_ROOT:-/opt/sola}"
BACKUP_ROOT="${BACKUP_ROOT:-/opt/sola-backups}"
FRONT_REMOTE_DIR="$DEPLOY_ROOT/frontend"
BACK_REMOTE_DIR="$DEPLOY_ROOT/backend"
PM2_APP_NAME="${PM2_APP_NAME:-sola}"

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
FRONT_ARCHIVE="sola-frontend_$(date +%Y%m%d_%H%M%S).tar.gz"
BACK_ARCHIVE="sola-backend_$(date +%Y%m%d_%H%M%S).tar.gz"

cleanup() {
  rm -f "$PROJECT_ROOT/$FRONT_ARCHIVE" "$PROJECT_ROOT/$BACK_ARCHIVE"
}
trap cleanup EXIT

require_cmd() {
  if ! command -v "$1" >/dev/null 2>&1; then
    echo "缺少依赖: $1"
    exit 1
  fi
}

require_cmd pnpm
require_cmd tar
require_cmd ssh
require_cmd scp

if [ ! -d "$PROJECT_ROOT/apps/web" ] || [ ! -d "$PROJECT_ROOT/apps/server" ]; then
  echo "请在项目根目录运行该脚本"
  exit 1
fi

echo "=== 安装依赖 ==="
pushd "$PROJECT_ROOT" >/dev/null
if [ ! -d node_modules ]; then
  echo "安装依赖..."
  pnpm install
fi
popd >/dev/null

echo "=== 构建前端 ==="
pnpm --filter @sola/web build

echo "打包前端构建产物: $FRONT_ARCHIVE"
tar -czf "$PROJECT_ROOT/$FRONT_ARCHIVE" -C "$PROJECT_ROOT/apps/web/dist" .

echo "=== 准备后端 ==="
if [ ! -f "$PROJECT_ROOT/package.json" ] || [ ! -d "$PROJECT_ROOT/apps/server" ]; then
  echo "后端目录结构缺失"
  exit 1
fi

echo "构建后端与依赖包..."
pnpm --filter @sola/db build
pnpm --filter @sola/shared build
pnpm --filter @sola/api build
pnpm --filter @sola/server build

echo "打包后端代码: $BACK_ARCHIVE"
tar -czf "$PROJECT_ROOT/$BACK_ARCHIVE" \
  --exclude='sola.db' \
  --exclude='.env' \
  --exclude='apps/server/public/tts' \
  -C "$PROJECT_ROOT" \
  package.json \
  pnpm-lock.yaml \
  pnpm-workspace.yaml \
  turbo.json \
  scripts \
  apps/server \
  packages/api \
  packages/db \
  packages/logic \
  packages/shared \
  packages/ui

FRONT_ARCHIVE_NAME="$(basename "$FRONT_ARCHIVE")"
BACK_ARCHIVE_NAME="$(basename "$BACK_ARCHIVE")"

echo "=== 上传构建产物到服务器 $SERVER_IP ==="
scp "$PROJECT_ROOT/$FRONT_ARCHIVE_NAME" "$USERNAME@$SERVER_IP:/tmp/"
scp "$PROJECT_ROOT/$BACK_ARCHIVE_NAME" "$USERNAME@$SERVER_IP:/tmp/"

echo "=== 远程部署 ==="
ssh "$USERNAME@$SERVER_IP" bash -s <<EOF
set -euo pipefail

export CI=1
export PNPM_DISABLE_PROMPT=1

DEPLOY_ROOT="$DEPLOY_ROOT"
BACKUP_ROOT="$BACKUP_ROOT"
FRONT_REMOTE_DIR="$FRONT_REMOTE_DIR"
FRONT_ARCHIVE_NAME="$FRONT_ARCHIVE_NAME"

BACK_REMOTE_DIR="$BACK_REMOTE_DIR"
BACK_ARCHIVE_NAME="$BACK_ARCHIVE_NAME"
PM2_APP_NAME="$PM2_APP_NAME"

DEPLOY_TS=\$(date +%Y%m%d_%H%M%S)

mkdir -p "\$DEPLOY_ROOT" "\$BACKUP_ROOT"
if [ -d "\$DEPLOY_ROOT" ]; then
  cp -a "\$DEPLOY_ROOT" "\$BACKUP_ROOT/sola_\$DEPLOY_TS" || \
    echo "备份失败，继续部署..."
fi

echo "--- 前端部署 ---"
rm -rf "\$FRONT_REMOTE_DIR"
mkdir -p "\$FRONT_REMOTE_DIR"
tar -xzf "/tmp/\$FRONT_ARCHIVE_NAME" -C "\$FRONT_REMOTE_DIR"
rm -f "/tmp/\$FRONT_ARCHIVE_NAME"
systemctl restart nginx

echo "--- 后端部署 ---"
if pm2 describe "\$PM2_APP_NAME" >/dev/null 2>&1; then
  pm2 stop "\$PM2_APP_NAME"
  pm2 delete "\$PM2_APP_NAME"
fi

DB_TMP="/tmp/sola_db_\$DEPLOY_TS.db"
ENV_TMP="/tmp/sola_env_\$DEPLOY_TS"
TTS_TMP="/tmp/sola_tts_\$DEPLOY_TS"
if [ -f "\$BACK_REMOTE_DIR/sola.db" ]; then
  mv "\$BACK_REMOTE_DIR/sola.db" "\$DB_TMP"
fi
if [ -f "\$BACK_REMOTE_DIR/.env" ]; then
  mv "\$BACK_REMOTE_DIR/.env" "\$ENV_TMP"
fi
if [ -d "\$BACK_REMOTE_DIR/apps/server/public/tts" ]; then
  mv "\$BACK_REMOTE_DIR/apps/server/public/tts" "\$TTS_TMP"
fi

rm -rf "\$BACK_REMOTE_DIR"
mkdir -p "\$BACK_REMOTE_DIR"
tar -xzf "/tmp/\$BACK_ARCHIVE_NAME" -C "\$BACK_REMOTE_DIR"
rm -f "/tmp/\$BACK_ARCHIVE_NAME"

cd "\$BACK_REMOTE_DIR"
if ! command -v pnpm >/dev/null 2>&1; then
  echo "未检测到 pnpm，尝试安装..."
  if command -v corepack >/dev/null 2>&1; then
    corepack enable
    corepack prepare pnpm@10.0.0 --activate
  else
    npm install -g pnpm@10.0.0
  fi
fi
PNPM_BIN="\$(command -v pnpm)"
\$PNPM_BIN install --prod
if [ -f "\$ENV_TMP" ]; then
  mv "\$ENV_TMP" .env
elif [ -f .env.example ]; then
  cp .env.example .env
fi
if [ -f "\$DB_TMP" ]; then
  mv "\$DB_TMP" sola.db
fi
if [ -d "\$TTS_TMP" ]; then
  mkdir -p apps/server/public
  rm -rf apps/server/public/tts
  mv "\$TTS_TMP" apps/server/public/tts
fi

if [ ! -f "sola.db" ]; then
  echo "未检测到 sola.db，开始初始化数据库..."
  touch sola.db
  export SOLA_DB_PATH="\${SOLA_DB_PATH:-\$BACK_REMOTE_DIR/sola.db}"
  \$PNPM_BIN install --prod=false
  \$PNPM_BIN --filter @sola/db db:push
  \$PNPM_BIN prune --prod
fi

pm2 start "\$PNPM_BIN" --name "\$PM2_APP_NAME" -- --filter @sola/server start
pm2 save
pm2 startup

echo "=== 部署完成 ==="
pm2 status
EOF

echo "=== 部署完成 ==="
echo "部署根目录: $DEPLOY_ROOT"
echo "备份目录: $BACKUP_ROOT"
