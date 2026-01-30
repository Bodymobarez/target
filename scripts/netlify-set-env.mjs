#!/usr/bin/env node
/**
 * Set DATABASE_URL on Netlify from local .env.
 * Requires: netlify link, and .env with DATABASE_URL.
 * Run: pnpm netlify:set-db
 */
import { config } from "dotenv";
import { execSync } from "child_process";
import { existsSync } from "fs";
import { resolve } from "path";

config({ path: resolve(process.cwd(), ".env") });

const url = process.env.DATABASE_URL;
if (!url || !url.trim()) {
  console.error("Missing DATABASE_URL in .env. Copy .env.example to .env and set your Neon URL.");
  process.exit(1);
}

// Escape for single-quoted shell arg (single quote -> '\'' )
const safe = url.replace(/'/g, "'\\''");
try {
  execSync(`npx netlify env:set DATABASE_URL '${safe}'`, {
    stdio: "inherit",
    shell: true,
  });
  console.log("DATABASE_URL set on Netlify. Trigger a new deploy (e.g. push a commit or Netlify → Deploys → Trigger deploy).");
} catch (e) {
  console.error("Failed. Ensure Netlify CLI is installed and site is linked:");
  console.error("  npx netlify link  (then run this script again)");
  process.exit(1);
}
