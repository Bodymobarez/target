import { Response } from "express";
import { prisma } from "../lib/prisma";
import { requireAuth, type AuthRequest } from "../middleware/auth";
import type { CreateOrderBody } from "@shared/api";

export async function createOrder(req: AuthRequest, res: Response): Promise<void> {
  try {
    const body = req.body as CreateOrderBody;
    const { items, subtotal, shipping, tax, total, currency = "USD", shippingAddress } = body ?? {};
    if (!items?.length || subtotal == null || shipping == null || tax == null || total == null) {
      res.status(400).json({ error: "Bad request", message: "items, subtotal, shipping, tax, total required" });
      return;
    }
    const userId = req.user?.id ?? null;
    const itemCreates = await Promise.all(
      items.map(async (i) => {
        const product = await prisma.product.findFirst({ where: { OR: [{ id: i.productId }, { slug: i.productId }] }, select: { id: true } });
        const productId = product?.id ?? i.productId;
        return { productId, name: i.name, price: i.price, quantity: i.quantity, color: i.color ?? null, image: i.image ?? null };
      })
    );
    const order = await prisma.order.create({
      data: {
        userId,
        status: "PENDING",
        subtotal,
        shipping,
        tax,
        total,
        currency,
        shippingAddress: (shippingAddress ?? {}) as object,
        items: { create: itemCreates },
      },
      include: { items: true },
    });
    const orderItems = (order as { items: { productId: string; name: string; price: { toNumber?: () => number }; quantity: number; image: string | null; color: string | null }[] }).items;
    res.status(201).json({
      id: order.id,
      status: order.status,
      subtotal: Number(order.subtotal),
      shipping: Number(order.shipping),
      tax: Number(order.tax),
      total: Number(order.total),
      currency: order.currency,
      createdAt: order.createdAt.toISOString(),
      items: orderItems.map((i) => ({
        productId: i.productId,
        name: i.name,
        price: Number(i.price),
        quantity: i.quantity,
        image: i.image ?? undefined,
        color: i.color ?? undefined,
      })),
    });
  } catch (e) {
    console.error("createOrder", e);
    res.status(500).json({ error: "Internal server error" });
  }
}

export async function markOrderPaid(req: AuthRequest, res: Response): Promise<void> {
  try {
    const orderId = (req.params as { id?: string }).id;
    if (!orderId) {
      res.status(400).json({ error: "Bad request", message: "Order id required" });
      return;
    }
    const order = await prisma.order.findUnique({ where: { id: orderId } });
    if (!order) {
      res.status(404).json({ error: "Not found", message: "Order not found" });
      return;
    }
    await prisma.order.update({
      where: { id: orderId },
      data: { status: "CONFIRMED", paidAt: new Date() },
    });
    const shipping = order.shippingAddress as { phone?: string } | null;
    res.status(200).json({
      ok: true,
      message: "Payment received. Notify customer on WhatsApp.",
      customerPhone: shipping?.phone ?? undefined,
    });
  } catch (e) {
    console.error("markOrderPaid", e);
    res.status(500).json({ error: "Internal server error" });
  }
}

/** Get one order by id (for payment page follow-up, no auth) */
export async function getOrderById(req: AuthRequest, res: Response): Promise<void> {
  try {
    const orderId = (req.params as { id?: string }).id;
    if (!orderId) {
      res.status(400).json({ error: "Bad request", message: "Order id required" });
      return;
    }
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { items: true },
    });
    if (!order) {
      res.status(404).json({ error: "Not found", message: "Order not found" });
      return;
    }
    const shipping = (order.shippingAddress ?? {}) as Record<string, unknown>;
    res.json({
      id: order.id,
      status: order.status,
      subtotal: Number(order.subtotal),
      shipping: Number(order.shipping),
      tax: Number(order.tax),
      total: Number(order.total),
      currency: order.currency,
      createdAt: order.createdAt.toISOString(),
      paidAt: order.paidAt?.toISOString(),
      shippingAddress: shipping,
      items: order.items.map((i) => ({
        productId: i.productId,
        name: i.name,
        price: Number(i.price),
        quantity: i.quantity,
        image: i.image ?? undefined,
        color: i.color ?? undefined,
      })),
    });
  } catch (e) {
    console.error("getOrderById", e);
    res.status(500).json({ error: "Internal server error" });
  }
}

/** Get all orders (admin only) with full detail and disbursement info */
export async function getAllOrders(req: AuthRequest, res: Response): Promise<void> {
  try {
    const orders = await prisma.order.findMany({
      orderBy: { createdAt: "desc" },
      include: { items: true, disbursements: { include: { warehouse: true, items: true } } },
    });
    res.json(
      orders.map((o) => {
        const shipping = (o.shippingAddress ?? {}) as { fullName?: string; phone?: string; email?: string; address?: string; governorate?: string };
        const disbursement = o.disbursements[0];
        return {
          id: o.id,
          status: o.status,
          customer: shipping.fullName ?? shipping.email ?? "—",
          phone: shipping.phone,
          email: shipping.email,
          address: shipping.address,
          governorate: shipping.governorate,
          total: Number(o.total),
          subtotal: Number(o.subtotal),
          shipping: Number(o.shipping),
          tax: Number(o.tax),
          currency: o.currency,
          date: o.createdAt.toISOString().slice(0, 10),
          createdAt: o.createdAt.toISOString(),
          tracking: o.trackingNumber ?? null,
          paidAt: o.paidAt?.toISOString(),
          shippingAddress: shipping,
          items: o.items.map((i) => ({
            productId: i.productId,
            name: i.name,
            price: Number(i.price),
            quantity: i.quantity,
            color: i.color ?? undefined,
            image: i.image ?? undefined,
          })),
          disbursement: disbursement
            ? {
                id: disbursement.id,
                warehouseId: disbursement.warehouseId,
                warehouseName: disbursement.warehouse.name,
                warehouseCode: disbursement.warehouse.code,
                status: disbursement.status,
                completedAt: disbursement.completedAt?.toISOString(),
                items: disbursement.items.map((di) => ({ productId: di.productId, quantity: di.quantity, pickedQuantity: di.pickedQuantity })),
              }
            : null,
        };
      })
    );
  } catch (e) {
    console.error("getAllOrders", e);
    res.status(500).json({ error: "Internal server error" });
  }
}

export async function getMyOrders(req: AuthRequest, res: Response): Promise<void> {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ error: "Unauthorized", message: "Token required" });
      return;
    }
    const orders = await prisma.order.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      include: { items: true },
    });
    res.json(
      orders.map((o) => ({
        id: o.id,
        status: o.status,
        subtotal: Number(o.subtotal),
        shipping: Number(o.shipping),
        tax: Number(o.tax),
        total: Number(o.total),
        currency: o.currency,
        createdAt: o.createdAt.toISOString(),
        shippedAt: o.shippedAt?.toISOString(),
        trackingNumber: o.trackingNumber ?? undefined,
        items: o.items.map((i) => ({
          productId: i.productId,
          name: i.name,
          price: Number(i.price),
          quantity: i.quantity,
          image: i.image ?? undefined,
          color: i.color ?? undefined,
        })),
      }))
    );
  } catch (e) {
    console.error("getMyOrders", e);
    res.status(500).json({ error: "Internal server error" });
  }
}
