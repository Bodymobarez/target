// Support Netlify env var name: use NETLIFY_DATABASE_URL if DATABASE_URL is not set
if (process.env.NETLIFY_DATABASE_URL && !process.env.DATABASE_URL) {
  process.env.DATABASE_URL = process.env.NETLIFY_DATABASE_URL;
}

import serverless from "serverless-http";

let serverlessHandler: ReturnType<typeof serverless> | null = null;

async function getHandler() {
  if (!serverlessHandler) {
    const { createServer } = await import("../../server");
    serverlessHandler = serverless(createServer());
  }
  return serverlessHandler;
}

export const handler = async (event: unknown, context: unknown) => {
  try {
    const h = await getHandler();
    return await h(event as Parameters<typeof h>[0], context as Parameters<typeof h>[1]);
  } catch (err) {
    console.error("Netlify API error:", err);
    return {
      statusCode: 503,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        error: "Service Unavailable",
        message: "Auth service temporarily unavailable. Use demo: admin@target.com / admin123",
      }),
    };
  }
};
