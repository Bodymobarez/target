import "dotenv/config";
import express from "express";
import cors from "cors";
import { handleDemo } from "./routes/demo";
import { getProducts, getProductById, getCategories } from "./routes/products";
import { authRoutes } from "./routes/auth";

export function createServer() {
  const app = express();

  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  app.get("/api/ping", (_req, res) => {
    const ping = process.env.PING_MESSAGE ?? "ping";
    res.json({ message: ping });
  });

  app.get("/api/demo", handleDemo);

  app.get("/api/categories", getCategories);
  app.get("/api/products", getProducts);
  app.get("/api/products/:id", getProductById);

  app.get("/api/auth/health", (_req, res) => res.json({ ok: true }));
  app.use("/api/auth", authRoutes);

  app.use((_req, _res, next) => next());

  return app;
}
