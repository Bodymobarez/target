# Deployment Guide

Premium Apple Store – Web (Vite + Express). Mobile (React Native/Expo) and full backend (NestJS + PostgreSQL) can be added later.

## Current stack

- **Frontend:** React 18, Vite, TailwindCSS, Framer Motion, Radix UI
- **Backend:** Express (dev only; add NestJS for production API)
- **Data:** Mock data in client; use Prisma + PostgreSQL when backend is ready

## Prerequisites

- Node.js 18+ (20+ recommended for future Vite 7)
- pnpm or npm

## Local development

```bash
pnpm install
pnpm dev
```

Open [http://localhost:8080](http://localhost:8080).

## Production build

```bash
pnpm build
pnpm start
```

- Client: static files in `dist/spa`
- Server: `dist/server/node-build.mjs` (Express)

## Environment

Create `.env`:

```env
# Optional for dev
PING_MESSAGE=ping

# When using Prisma
DATABASE_URL="postgresql://user:pass@host:5432/dbname"

# When adding auth
JWT_SECRET=your-secret
JWT_REFRESH_SECRET=your-refresh-secret
```

## Database (when ready)

1. Install Prisma: `pnpm add prisma @prisma/client`
2. Set `DATABASE_URL` in `.env`
3. Run: `npx prisma migrate dev`
4. Seed: `npx prisma db seed` (add script in `package.json`)

## Deployment options

### Vercel / Netlify (frontend only)

- Build command: `pnpm build` (client only; use `vite build`)
- Publish directory: `dist/spa`
- API: deploy Express separately or use serverless functions (see `netlify/functions/`)

### Docker (full app)

- Add `Dockerfile` that runs `node dist/server/node-build.mjs` and serves `dist/spa`
- Or separate containers: static hosting for SPA + Node for API

### AWS / GCP / Azure

- **Static:** S3 + CloudFront, or equivalent, for `dist/spa`
- **API:** EC2, ECS, or serverless (Lambda) for Express or future NestJS app
- **DB:** RDS (PostgreSQL), managed Redis for cache/sessions

## PWA (optional)

- Add `vite-plugin-pwa` and configure in `vite.config.ts`
- Add `manifest.json` and service worker for offline support

## Checklist

- [ ] Set production `DATABASE_URL` and run migrations
- [ ] Configure auth (JWT, refresh, Apple/Google sign-in)
- [ ] Enable HTTPS and secure cookies
- [ ] Set up CDN for images/videos
- [ ] Configure rate limiting and CORS
- [ ] Add monitoring (e.g. Sentry, LogRocket)
