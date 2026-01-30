#!/usr/bin/env node
/**
 * Deploy to Netlify without interactive prompts.
 * Requires in .env: NETLIFY_AUTH_TOKEN, NETLIFY_SITE_ID
 * Get token: Netlify → User settings → Applications → New access token
 * Get site ID: Site → Site settings → General → Site information
 * Run: node scripts/netlify-deploy.mjs   or  npm run netlify:deploy:ci
 */
import { config } from "dotenv";
import { execSync } from "child_process";
import { resolve } from "path";

config({ path: resolve(process.cwd(), ".env") });

const token = process.env.NETLIFY_AUTH_TOKEN;
const siteId = process.env.NETLIFY_SITE_ID;

if (!token?.trim()) {
  console.error("Missing NETLIFY_AUTH_TOKEN in .env");
  console.error("Get it: Netlify → User settings → Applications → New access token");
  process.exit(1);
}
if (!siteId?.trim()) {
  console.error("Missing NETLIFY_SITE_ID in .env");
  console.error("Get it: Netlify → Site → Site settings → General → Site information");
  process.exit(1);
}

const cwd = process.cwd();
console.log("Deploying to Netlify (build runs from netlify.toml)...");
execSync(
  `npx netlify deploy --auth "${token}" --site "${siteId}" --prod`,
  { cwd, stdio: "inherit", env: { ...process.env } }
);
console.log("Deploy done.");
