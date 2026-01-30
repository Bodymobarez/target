/**
 * Vercel serverless entry: all /api/* requests are rewritten to /api and hit this handler.
 * Exports the Express app so Vercel runs it as a single function.
 * Set DATABASE_URL from Vercel Postgres / Neon env vars if not already set.
 */
if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL =
    process.env.POSTGRES_PRISMA_URL ??
    process.env.POSTGRES_URL ??
    process.env.NETLIFY_DATABASE_URL;
}

import { createServer } from "../server";

export default createServer();
