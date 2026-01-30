import { Response } from "express";
import { prisma } from "../lib/prisma";
import type { AuthRequest } from "../middleware/auth";

export async function listWarehouses(_req: AuthRequest, res: Response): Promise<void> {
  try {
    const list = await prisma.warehouse.findMany({
      orderBy: { code: "asc" },
    });
    res.json(
      list.map((w) => ({
        id: w.id,
        name: w.name,
        code: w.code,
        address: w.address ?? undefined,
        isActive: w.isActive,
        createdAt: w.createdAt.toISOString(),
      }))
    );
  } catch (e) {
    console.error("listWarehouses", e);
    res.status(500).json({ error: "Internal server error" });
  }
}

export async function createWarehouse(req: AuthRequest, res: Response): Promise<void> {
  try {
    const body = req.body as { name?: string; code?: string; address?: string };
    const { name, code, address } = body ?? {};
    if (!name?.trim() || !code?.trim()) {
      res.status(400).json({ error: "Bad request", message: "name and code required" });
      return;
    }
    const warehouse = await prisma.warehouse.create({
      data: { name: name.trim(), code: code.trim().toUpperCase(), address: address?.trim() || null },
    });
    res.status(201).json({
      id: warehouse.id,
      name: warehouse.name,
      code: warehouse.code,
      address: warehouse.address ?? undefined,
      isActive: warehouse.isActive,
      createdAt: warehouse.createdAt.toISOString(),
    });
  } catch (e) {
    console.error("createWarehouse", e);
    res.status(500).json({ error: "Internal server error" });
  }
}

export async function updateWarehouse(req: AuthRequest, res: Response): Promise<void> {
  try {
    const id = (req.params as { id?: string }).id;
    const body = req.body as { name?: string; code?: string; address?: string; isActive?: boolean };
    if (!id) {
      res.status(400).json({ error: "Bad request", message: "id required" });
      return;
    }
    const warehouse = await prisma.warehouse.update({
      where: { id },
      data: {
        ...(body.name != null && { name: body.name.trim() }),
        ...(body.code != null && { code: body.code.trim().toUpperCase() }),
        ...(body.address !== undefined && { address: body.address?.trim() || null }),
        ...(body.isActive !== undefined && { isActive: body.isActive }),
      },
    });
    res.json({
      id: warehouse.id,
      name: warehouse.name,
      code: warehouse.code,
      address: warehouse.address ?? undefined,
      isActive: warehouse.isActive,
      createdAt: warehouse.createdAt.toISOString(),
    });
  } catch (e) {
    console.error("updateWarehouse", e);
    res.status(500).json({ error: "Internal server error" });
  }
}
