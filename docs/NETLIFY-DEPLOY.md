# Deploy TARGET to Netlify

## Option A: Connect GitHub (recommended — auto-deploy on push)

1. Go to **[Netlify](https://app.netlify.com)** and sign in.
2. Click **Add new site** → **Import an existing project**.
3. Choose **GitHub** and authorize Netlify if needed.
4. Select the repo: **Bodymobarez/target**.
5. Netlify will use these settings from `netlify.toml`:
   - **Build command:** `npm run build:client && npx prisma generate`
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

For **login and registration** to work on Netlify, set one of:

- **DATABASE_URL** — Your Neon (or other) PostgreSQL connection string, or  
- **NETLIFY_DATABASE_URL** — Same value; the app uses it as a fallback for `DATABASE_URL`.

**Site settings** → **Environment variables** → Add `DATABASE_URL` or `NETLIFY_DATABASE_URL` with your connection string.

Without either variable, the auth API will return 503 and you can use the demo account: **admin@target.com** / **admin123**.

Do not commit `.env`; it is gitignored.
