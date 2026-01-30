// Set DATABASE_URL from platform env vars if not already set
if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL =
    process.env.POSTGRES_PRISMA_URL ??
    process.env.POSTGRES_URL ??
    process.env.NETLIFY_DATABASE_URL;
}

import serverless from "serverless-http";

let serverlessHandler: ReturnType<typeof serverless> | null = null;

function json503(message: string) {
  return {
    statusCode: 503,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ error: "Service Unavailable", message }),
  };
}

async function getHandler() {
  if (!serverlessHandler) {
    const { createServer } = await import("../../server");
    serverlessHandler = serverless(createServer());
  }
  return serverlessHandler;
}

export const handler = async (event: unknown, context: unknown) => {
  // Fail fast if DB URL is missing (saves cold start and gives clear feedback)
  const dbUrl =
    process.env.DATABASE_URL ||
    process.env.POSTGRES_PRISMA_URL ||
    process.env.POSTGRES_URL ||
    process.env.NETLIFY_DATABASE_URL;
  if (!dbUrl || dbUrl.trim() === "") {
    return json503(
      "Database not configured. In Netlify: Site settings → Environment variables → add DATABASE_URL (or NETLIFY_DATABASE_URL) with scope 'All'. Then redeploy."
    );
  }

  try {
    const h = await getHandler();
    return await h(event as Parameters<typeof h>[0], context as Parameters<typeof h>[1]);
  } catch (err) {
    const ex = err as Error & { code?: string };
    console.error("Netlify API error:", ex);

    const msg =
      ex.code === "P1001" || ex.message?.includes("Can't reach database")
        ? "Database unreachable. Check DATABASE_URL in Netlify env (use Neon pooled URL with ?sslmode=require). Redeploy after changing env."
        : ex.code === "P1009" || ex.message?.includes("already exists") || ex.message?.includes("does not exist")
          ? "Schema out of sync. Trigger a new deploy so build runs: prisma db push && prisma db seed."
          : "Service temporarily unavailable. Set DATABASE_URL in Netlify (scope: All) and redeploy. Demo: admin@target.com / admin123";

    return json503(msg);
  }
};
