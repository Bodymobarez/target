# Deploy TARGET to Netlify

## Option A: Connect GitHub (recommended — auto-deploy on push)

1. Go to **[Netlify](https://app.netlify.com)** and sign in.
2. Click **Add new site** → **Import an existing project**.
3. Choose **GitHub** and authorize Netlify if needed.
4. Select the repo: **Bodymobarez/target**.
5. Netlify will use these settings from `netlify.toml`:
   - **Build command:** `npm run build:client`
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

If you use **Neon** or other secrets, add them in Netlify:

**Site settings** → **Environment variables** → **Add variable** (e.g. `DATABASE_URL`).

Do not commit `.env`; it is gitignored.
