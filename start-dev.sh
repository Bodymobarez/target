#!/usr/bin/env bash
# تشغيل السيرفر وفتح التطبيق — مع تجهيز قاعدة البيانات
# Run dev server and prepare DB so everything shows

cd "$(dirname "$0")"

# Load nvm/fnm if available
export NVM_DIR="${NVM_DIR:-$HOME/.nvm}"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
[ -s "$HOME/.zshrc" ] && \. "$HOME/.zshrc" 2>/dev/null

echo "Checking dependencies..."
(command -v pnpm >/dev/null && pnpm install) || npm install

# تجهيز Prisma وقاعدة البيانات (حتى تظهر المنتجات والإعدادات)
if [ -f ".env" ] && grep -q "DATABASE_URL" .env 2>/dev/null; then
  echo "Preparing database..."
  (command -v pnpm >/dev/null && pnpm exec prisma generate) || npx prisma generate
  (command -v pnpm >/dev/null && pnpm exec prisma db push) || npx prisma db push --accept-data-loss 2>/dev/null || true
  (command -v pnpm >/dev/null && pnpm run db:seed) || npx tsx prisma/seed.ts 2>/dev/null || true
fi

echo "Starting dev server at http://localhost:8080"
(command -v pnpm >/dev/null && pnpm dev) || npm run dev
