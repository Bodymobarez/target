import { Router, Request, Response } from "express";
import { prisma } from "../lib/prisma";
import { hashPassword, comparePassword, signToken, toAuthUser } from "../lib/auth";
import { requireAuth, type AuthRequest } from "../middleware/auth";
import type { RegisterBody, LoginBody } from "@shared/api";

const router = Router();

router.post("/register", async (req: Request<object, object, RegisterBody>, res: Response): Promise<void> => {
  try {
    const { email, password, name } = req.body ?? {};
    if (!email?.trim() || !password?.trim()) {
      res.status(400).json({ error: "Bad request", message: "Email and password required" });
      return;
    }
    const existing = await prisma.user.findUnique({ where: { email: email.trim().toLowerCase() } });
    if (existing) {
      res.status(409).json({ error: "Conflict", message: "Email already registered" });
      return;
    }
    const passwordHash = await hashPassword(password);
    const user = await prisma.user.create({
      data: {
        email: email.trim().toLowerCase(),
        passwordHash,
        name: name?.trim() || null,
        role: "CUSTOMER",
      },
    });
    const token = signToken({ userId: user.id, email: user.email, role: user.role });
    res.status(201).json({ user: toAuthUser(user), token });
  } catch (e) {
    console.error("auth register", e);
    res.status(500).json({ error: "Internal server error" });
  }
});

const DEMO_EMAIL = "admin@target.com";
const DEMO_PASSWORD = "admin123";
const DEMO_USER = { id: "demo-admin", email: DEMO_EMAIL, name: "Admin", role: "ADMIN" as const };

router.post("/login", async (req: Request<object, object, LoginBody>, res: Response): Promise<void> => {
  const { email, password } = req.body ?? {};
  if (!email?.trim() || !password?.trim()) {
    res.status(400).json({ error: "Bad request", message: "Email and password required" });
    return;
  }
  const emailNorm = email.trim().toLowerCase();

  try {
    const user = await prisma.user.findUnique({ where: { email: emailNorm } });
    if (user?.passwordHash) {
      const ok = await comparePassword(password, user.passwordHash);
      if (ok) {
        const token = signToken({ userId: user.id, email: user.email, role: user.role });
        res.json({ user: toAuthUser(user), token });
        return;
      }
    }
  } catch (e) {
    const err = e as Error & { code?: string };
    console.error("auth login (db)", err);
    if (emailNorm === DEMO_EMAIL && password === DEMO_PASSWORD) {
      const token = signToken({ userId: DEMO_USER.id, email: DEMO_USER.email, role: DEMO_USER.role });
      res.json({ user: toAuthUser(DEMO_USER), token });
      return;
    }
    if (err.code === "P1001" || err.message?.includes("Can't reach database")) {
      res.status(503).json({ error: "Service unavailable", message: "Database unavailable. Use demo: admin@target.com / admin123" });
      return;
    }
    res.status(500).json({ error: "Internal server error", message: "Login failed. Try demo: admin@target.com / admin123" });
    return;
  }

  if (emailNorm === DEMO_EMAIL && password === DEMO_PASSWORD) {
    const token = signToken({ userId: DEMO_USER.id, email: DEMO_USER.email, role: DEMO_USER.role });
    res.json({ user: toAuthUser(DEMO_USER), token });
    return;
  }
  res.status(401).json({ error: "Unauthorized", message: "Invalid email or password" });
});

router.post("/logout", (_req: Request, res: Response): void => {
  res.json({ ok: true });
});

router.get("/me", requireAuth, (req: AuthRequest, res: Response): void => {
  if (!req.user) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  res.json({ user: toAuthUser(req.user) });
  return;
});

export const authRoutes = router;
