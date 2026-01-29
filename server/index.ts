import "dotenv/config";
import express from "express";
import cors from "cors";
import { handleDemo } from "./routes/demo";
import { getProducts, getProductById, getCategories, getFeaturedProducts } from "./routes/products";
import { authRoutes } from "./routes/auth";
import { createOrder, getMyOrders } from "./routes/orders";
import { optionalAuth, requireAuth } from "./middleware/auth";
import type { AuthRequest } from "./middleware/auth";

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
  app.get("/api/products/featured", getFeaturedProducts);
  app.get("/api/products/:id", getProductById);

  app.post("/api/orders", optionalAuth, (req, res) => createOrder(req as AuthRequest, res));
  app.get("/api/orders/me", requireAuth, (req, res) => getMyOrders(req as AuthRequest, res));

  app.get("/api/auth/health", (_req, res) => res.json({ ok: true }));
  app.use("/api/auth", authRoutes);

  app.use((_req, _res, next) => next());

  return app;
}
