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
