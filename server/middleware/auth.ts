import type { Request, Response, NextFunction } from "express";
import { verifyToken, toAuthUser } from "../lib/auth";
import { prisma } from "../lib/prisma";

export interface AuthRequest extends Request {
  user?: { id: string; email: string; name: string | null; role: string };
}

async function setUserFromToken(req: AuthRequest, token: string | undefined): Promise<boolean> {
  if (!token) return false;
  const payload = verifyToken(token);
  if (!payload) return false;
  if (payload.userId === "demo-admin") {
    req.user = { id: payload.userId, email: payload.email, name: "Admin", role: payload.role };
    return true;
  }
  try {
    const user = await prisma.user.findUnique({ where: { id: payload.userId } });
    if (!user) return false;
    req.user = { id: user.id, email: user.email, name: user.name, role: user.role };
    return true;
  } catch {
    return false;
  }
}

export async function optionalAuth(req: AuthRequest, _res: Response, next: NextFunction): Promise<void> {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : (req.body?.token ?? req.query?.token);
  await setUserFromToken(req, token as string | undefined);
  next();
}

export async function requireAuth(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : (req.body?.token ?? req.query?.token);

  if (!token) {
    res.status(401).json({ error: "Unauthorized", message: "Token required" });
    return;
  }

  const ok = await setUserFromToken(req, token as string);
  if (!ok) {
    res.status(401).json({ error: "Unauthorized", message: "Invalid or expired token" });
    return;
  }
  next();
}

export function requireAdmin(req: AuthRequest, res: Response, next: NextFunction): void {
  if (!req.user) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  if (req.user.role !== "ADMIN") {
    res.status(403).json({ error: "Forbidden", message: "Admin only" });
    return;
  }
  next();
}
