import "dotenv/config";
import express from "express";
import cors from "cors";
import { handleDemo } from "./routes/demo";
import { getProducts, getProductById, getCategories, getFeaturedProducts } from "./routes/products";
import { authRoutes } from "./routes/auth";
import { createOrder, getMyOrders, markOrderPaid, getOrderById, getAllOrders } from "./routes/orders";
import { listWarehouses, createWarehouse, updateWarehouse } from "./routes/warehouses";
import { listDisbursements, createDisbursement, updateDisbursementStatus } from "./routes/disbursements";
import { getHomeLayout, updateHomeLayout, getSiteTheme, updateSiteTheme } from "./routes/settings";
import { optionalAuth, requireAuth, requireAdmin } from "./middleware/auth";
import type { AuthRequest } from "./middleware/auth";

export function createServer() {
  const app = express();

  // Vercel: rewrite /api/:path* -> /api?path=:path*; restore req.url so Express routing works
  app.use((req, _res, next) => {
    const pathSeg = req.query.path;
    const isVercelApi = req.url === "/api" || (req.url?.startsWith("/api?") ?? false);
    if (pathSeg != null && isVercelApi) {
      if (typeof pathSeg === "string" && pathSeg) {
        req.url = `/api/${pathSeg}`;
        delete (req as Record<string, unknown>).query.path;
      } else if (Array.isArray(pathSeg) && pathSeg.length > 0) {
        req.url = `/api/${(pathSeg as string[]).join("/")}`;
        delete (req as Record<string, unknown>).query.path;
      }
    }
    next();
  });

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
  app.get("/api/orders/all", requireAuth, requireAdmin, (req, res) => getAllOrders(req as AuthRequest, res));
  app.get("/api/orders/:id", (req, res) => getOrderById(req as AuthRequest, res));
  app.patch("/api/orders/:id/paid", requireAuth, requireAdmin, (req, res) => markOrderPaid(req as AuthRequest, res));

  app.get("/api/warehouses", requireAuth, requireAdmin, (req, res) => listWarehouses(req as AuthRequest, res));
  app.post("/api/warehouses", requireAuth, requireAdmin, (req, res) => createWarehouse(req as AuthRequest, res));
  app.patch("/api/warehouses/:id", requireAuth, requireAdmin, (req, res) => updateWarehouse(req as AuthRequest, res));

  app.get("/api/disbursements", requireAuth, requireAdmin, (req, res) => listDisbursements(req as AuthRequest, res));
  app.post("/api/disbursements", requireAuth, requireAdmin, (req, res) => createDisbursement(req as AuthRequest, res));
  app.patch("/api/disbursements/:id/status", requireAuth, requireAdmin, (req, res) => updateDisbursementStatus(req as AuthRequest, res));

  app.get("/api/settings/home-layout", (req, res) => getHomeLayout(req as AuthRequest, res));
  app.patch("/api/settings/home-layout", requireAuth, requireAdmin, (req, res) => updateHomeLayout(req as AuthRequest, res));
  app.get("/api/settings/theme", (req, res) => getSiteTheme(req as AuthRequest, res));
  app.patch("/api/settings/theme", requireAuth, requireAdmin, (req, res) => updateSiteTheme(req as AuthRequest, res));

  app.post("/api/upload", requireAuth, requireAdmin, async (req, res) => {
    try {
      const { uploadMiddleware, handleUpload } = await import("./routes/upload.js");
      uploadMiddleware(req, res, (err: unknown) => {
        if (err) {
          const message = err instanceof Error ? err.message : "Upload failed";
          const code = (err as { code?: string }).code;
          if (code === "LIMIT_FILE_SIZE") return res.status(400).json({ error: "Bad request", message: "File too large (max 5MB)" });
          return res.status(400).json({ error: "Bad request", message });
        }
        void handleUpload(req as AuthRequest & { file?: Express.Multer.File }, res);
      });
    } catch {
      res.status(503).json({ error: "Upload unavailable", message: "Install multer: pnpm add multer" });
    }
  });
  app.use("/uploads", express.static("public/uploads"));

  app.get("/api/auth/health", (_req, res) => res.json({ ok: true }));
  app.use("/api/auth", authRoutes);

  app.use((_req, _res, next) => next());

  return app;
}
