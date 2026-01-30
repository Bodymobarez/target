import { Response } from "express";
import { prisma } from "../lib/prisma";
import type { AuthRequest } from "../middleware/auth";

/** List all disbursements (admin) */
export async function listDisbursements(req: AuthRequest, res: Response): Promise<void> {
  try {
    const warehouseId = req.query.warehouseId as string | undefined;
    const status = req.query.status as string | undefined;
    const list = await prisma.disbursement.findMany({
      where: {
        ...(warehouseId && { warehouseId }),
        ...(status && { status: status as "PENDING" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED" }),
      },
      orderBy: { createdAt: "desc" },
      include: {
        order: { include: { items: true } },
        warehouse: true,
        items: { include: { product: { select: { id: true, name: true, slug: true } } } },
      },
    });
    res.json(
      list.map((d) => ({
        id: d.id,
        orderId: d.orderId,
        warehouseId: d.warehouseId,
        warehouse: d.warehouse ? { id: d.warehouse.id, name: d.warehouse.name, code: d.warehouse.code } : null,
        status: d.status,
        notes: d.notes ?? undefined,
        completedAt: d.completedAt?.toISOString(),
        createdAt: d.createdAt.toISOString(),
        order: {
          id: d.order.id,
          status: d.order.status,
          total: Number(d.order.total),
          currency: d.order.currency,
          shippingAddress: d.order.shippingAddress,
        },
        items: d.items.map((i) => ({
          productId: i.productId,
          productName: i.product.name,
          quantity: i.quantity,
          pickedQuantity: i.pickedQuantity,
        })),
      }))
    );
  } catch (e) {
    console.error("listDisbursements", e);
    res.status(500).json({ error: "Internal server error" });
  }
}

/** Create disbursement for an order (send to warehouse for picking). Order must be CONFIRMED. */
export async function createDisbursement(req: AuthRequest, res: Response): Promise<void> {
  try {
    const body = req.body as { orderId: string; warehouseId: string; notes?: string };
    const { orderId, warehouseId, notes } = body ?? {};
    if (!orderId || !warehouseId) {
      res.status(400).json({ error: "Bad request", message: "orderId and warehouseId required" });
      return;
    }
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { items: true, disbursements: true },
    });
    if (!order) {
      res.status(404).json({ error: "Not found", message: "Order not found" });
      return;
    }
    if (order.status !== "CONFIRMED") {
      res.status(400).json({ error: "Bad request", message: "Order must be CONFIRMED (payment approved) before creating disbursement" });
      return;
    }
    if (order.disbursements.length > 0) {
      res.status(400).json({ error: "Bad request", message: "Order already has a disbursement" });
      return;
    }
    const warehouse = await prisma.warehouse.findFirst({ where: { id: warehouseId, isActive: true } });
    if (!warehouse) {
      res.status(404).json({ error: "Not found", message: "Warehouse not found or inactive" });
      return;
    }
    const disbursement = await prisma.disbursement.create({
      data: {
        orderId,
        warehouseId,
        notes: notes?.trim() || null,
        status: "PENDING",
        items: {
          create: order.items.map((i) => ({
            productId: i.productId,
            quantity: i.quantity,
          })),
        },
      },
      include: { items: true, warehouse: true, order: true },
    });
    await prisma.order.update({
      where: { id: orderId },
      data: { status: "PROCESSING" },
    });
    res.status(201).json({
      id: disbursement.id,
      orderId: disbursement.orderId,
      warehouseId: disbursement.warehouseId,
      warehouse: { id: disbursement.warehouse.id, name: disbursement.warehouse.name, code: disbursement.warehouse.code },
      status: disbursement.status,
      notes: disbursement.notes ?? undefined,
      createdAt: disbursement.createdAt.toISOString(),
      items: disbursement.items.map((i) => ({ productId: i.productId, quantity: i.quantity, pickedQuantity: i.pickedQuantity })),
    });
  } catch (e) {
    console.error("createDisbursement", e);
    res.status(500).json({ error: "Internal server error" });
  }
}

/** Update disbursement status (PENDING → IN_PROGRESS → COMPLETED) */
export async function updateDisbursementStatus(req: AuthRequest, res: Response): Promise<void> {
  try {
    const id = (req.params as { id?: string }).id;
    const body = req.body as { status: "IN_PROGRESS" | "COMPLETED" | "CANCELLED" };
    if (!id || !body.status) {
      res.status(400).json({ error: "Bad request", message: "id and status required" });
      return;
    }
    const disbursement = await prisma.disbursement.findUnique({
      where: { id },
      include: { order: true },
    });
    if (!disbursement) {
      res.status(404).json({ error: "Not found", message: "Disbursement not found" });
      return;
    }
    const updateData: { status: string; completedAt?: Date } = { status: body.status };
    if (body.status === "COMPLETED") {
      updateData.completedAt = new Date();
    }
    const updated = await prisma.disbursement.update({
      where: { id },
      data: updateData,
      include: { items: true, warehouse: true },
    });
    if (body.status === "COMPLETED") {
      await prisma.order.update({
        where: { id: disbursement.orderId },
        data: { status: "PROCESSING" },
      });
    }
    res.json({
      id: updated.id,
      orderId: updated.orderId,
      status: updated.status,
      completedAt: updated.completedAt?.toISOString(),
    });
  } catch (e) {
    console.error("updateDisbursementStatus", e);
    res.status(500).json({ error: "Internal server error" });
  }
}
