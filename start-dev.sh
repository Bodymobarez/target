#!/usr/bin/env bash
# تشغيل السيرفر وفتح التطبيق
# Run dev server and open app

cd "$(dirname "$0")"

# Load nvm/fnm if available
export NVM_DIR="${NVM_DIR:-$HOME/.nvm}"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
[ -s "$HOME/.zshrc" ] && \. "$HOME/.zshrc" 2>/dev/null

if [ ! -d "node_modules" ]; then
  echo "Installing dependencies..."
  (command -v pnpm >/dev/null && pnpm install) || npm install
fi

echo "Starting dev server at http://localhost:8080"
(command -v pnpm >/dev/null && pnpm dev) || npm run dev
