# Deploy TARGET to Netlify

## رفع على النتليفاي (خلاصة)

- **لو المشروع على GitHub:** ادخل [app.netlify.com](https://app.netlify.com) → Add new site → Import from Git → اختر المستودع. بعدها كل **push** على الفرع المتصل يرفع تلقائياً.
- **من جهازك (بدون أي تفاعل):** ضع في `.env`:
  - `NETLIFY_AUTH_TOKEN` — من Netlify → User settings → Applications → New access token
  - `NETLIFY_SITE_ID` — من الموقع → Site settings → General → Site information  
  ثم نفّذ: **`npm run netlify:deploy:ci`** وسيتم البناء والرفع تلقائياً.
- **من جهازك (مع ربط يدوي):** مرة واحدة `npx netlify link` ثم `npx netlify deploy --prod`.

---

## Option A: Connect GitHub (recommended — auto-deploy on push)

1. Go to **[Netlify](https://app.netlify.com)** and sign in.
2. Click **Add new site** → **Import an existing project**.
3. Choose **GitHub** and authorize Netlify if needed.
4. Select the repo: **Bodymobarez/target**.
5. Netlify will use these settings from `netlify.toml`:
   - **Build command:** Builds the client, then runs `prisma generate`, `prisma db push` (sync schema to DB), and `prisma db seed` (admin + categories + products). Uses `NETLIFY_DATABASE_URL` or `DATABASE_URL`.
   - **Publish directory:** `dist/spa`
   - **Functions:** `netlify/functions`
6. Click **Deploy site**.

After this, every push to `main` on GitHub will trigger a new deploy.

---

## Option B: Deploy from your computer (Netlify CLI)

```bash
# Install Netlify CLI once
npm install -g netlify-cli

# Build
npm run build:client

# Link to a new site (first time only — pick "Create & configure a new project")
netlify init

# Deploy to production
netlify deploy --prod
```

Or link to an existing Netlify site:

```bash
netlify link
netlify deploy --prod
```

---

## Environment variables

For **login, registration, products, and categories** to work on Netlify, set one of:

- **DATABASE_URL** — Your Neon (or other) PostgreSQL connection string, or  
- **NETLIFY_DATABASE_URL** — Same value; the build and API use it as a fallback for `DATABASE_URL`.

**Option 1 — From the Netlify UI:**  
**Site settings** → **Environment variables** → Add `DATABASE_URL` or `NETLIFY_DATABASE_URL` with your connection string.

**Option 2 — From your machine (uses local `.env`):**
```bash
npx netlify link   # once: pick your existing site
npm run netlify:set-db   # reads .env and sets DATABASE_URL on Netlify
```
Then trigger a new deploy (push a commit, or Netlify → Deploys → Trigger deploy).

- **Scope:** set to **All** (or at least **Functions**). If the variable is only available at build time, the API will return 503 at runtime.
- The build runs `prisma db push` and `prisma db seed`, so the production DB gets tables and initial data (admin user, categories, products). Without either variable, the build may fail and the API will return 503.

Do not commit `.env`; it is gitignored.

---

## Troubleshooting 503 (API / Database)

If `/api/categories`, `/api/products`, `/api/auth/login`, etc. return **503**:

1. **Env var for runtime**
   - In Netlify: **Site settings** → **Environment variables**.
   - Ensure `DATABASE_URL` (or `NETLIFY_DATABASE_URL`) exists and **Scopes** includes **All** or **Functions**. If it’s only **Build**, the serverless function won’t see it and will return 503.
   - After changing variables, trigger a **new deploy** (Deploys → Trigger deploy).

2. **Neon (PostgreSQL)**
   - Use the **pooled** connection string (host like `xxx-pooler.xxx.neon.tech`) for serverless; direct connection can hit limits.
   - Add `?sslmode=require` if required (e.g. `postgresql://...?sslmode=require`).
   - In Neon dashboard, ensure the project allows external connections (no IP allowlist blocking Netlify).

3. **Schema / seed**
   - If the error says schema is out of sync, run a fresh deploy so the build runs `prisma db push` and `prisma db seed` again.
   - Check the **Deploy log** for failures during `prisma db push` or `prisma db seed`; fix DB URL or Neon project and redeploy.
