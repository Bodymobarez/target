# Auth Setup (Sign In, Sign Up, Admin)

## Backend

- **API:** `POST /api/auth/register`, `POST /api/auth/login`, `POST /api/auth/logout`, `GET /api/auth/me`
- **Auth:** JWT in `Authorization: Bearer <token>`. Token stored in `localStorage` key `target-auth-token`.
- **Env:** Add to `.env`:
  - `DATABASE_URL` — Neon PostgreSQL connection string
  - `JWT_SECRET` — Secret for signing JWTs (change in production)

## Database

1. Run migrations or push schema:
   ```bash
   pnpm db:push
   # or
   pnpm db:migrate
   ```
2. Create an admin user (optional; for `/admin` access):
   ```bash
   ADMIN_EMAIL=admin@target.com ADMIN_PASSWORD=admin123 pnpm db:seed
   ```
   Or in Prisma Studio: create a user with `role: ADMIN` and set `passwordHash` using bcrypt hash of your password.

## Frontend

- **Sign In:** `/signin` — email + password
- **Sign Up:** `/signup` — name (optional), email, password
- **Sign Out:** Header (desktop/mobile) and Profile page
- **Admin:** `/admin` — requires logged-in user with role `ADMIN`; otherwise redirect to `/signin`

## Install

If you added new dependencies, run:

```bash
npm install
# or
pnpm install
```

Then:

```bash
pnpm db:generate
pnpm db:push
pnpm db:seed   # optional: create admin user
pnpm dev
```
