import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import type { AuthUser, ApiRole } from "@shared/api";

const JWT_SECRET = process.env.JWT_SECRET ?? "target-dev-secret-change-in-production";
const SALT_ROUNDS = 10;

export function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

export function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function signToken(payload: { userId: string; email: string; role: ApiRole }): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
}

export function verifyToken(token: string): { userId: string; email: string; role: ApiRole } | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; email: string; role: ApiRole };
    return decoded;
  } catch {
    return null;
  }
}

export function toAuthUser(row: { id: string; email: string; name: string | null; role: string }): AuthUser {
  return {
    id: row.id,
    email: row.email,
    name: row.name,
    role: row.role as ApiRole,
  };
}
