import "dotenv/config";
import express from "express";
import cors from "cors";
import { handleDemo } from "./routes/demo";
import { getProducts, getProductById, getCategories } from "./routes/products";

export function createServer() {
  const app = express();

  // Middleware
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Example API routes
  app.get("/api/ping", (_req, res) => {
    const ping = process.env.PING_MESSAGE ?? "ping";
    res.json({ message: ping });
  });

  app.get("/api/demo", handleDemo);

  // Products & categories API
  app.get("/api/categories", getCategories);
  app.get("/api/products", getProducts);
  app.get("/api/products/:id", getProductById);

  // Pass all non-API requests to Vite (SPA)
  app.use((_req, _res, next) => next());

  return app;
}
