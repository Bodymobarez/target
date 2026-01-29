import { RequestHandler } from "express";
import { prisma } from "../lib/prisma";
import { Decimal } from "@prisma/client/runtime/library";

function toNumber(d: Decimal | null | undefined): number {
  if (d == null) return 0;
  return Number(d);
}

function productToApi(p: {
  id: string;
  slug: string;
  name: string;
  categoryId: string;
  category: { slug: string; name: string };
  description: string;
  shortDescription: string | null;
  price: Decimal;
  originalPrice: Decimal | null;
  currency: string;
  badge: string | null;
  inStock: boolean;
  rating: Decimal;
  reviewCount: number;
  videoUrl: string | null;
  images: { url: string }[];
  specs: { label: string; value: string }[];
  colors: { name: string; hex: string }[];
}) {
  return {
    id: p.id,
    slug: p.slug,
    name: p.name,
    categoryId: p.category.slug,
    categoryName: p.category.name,
    description: p.description,
    shortDescription: p.shortDescription ?? "",
    price: toNumber(p.price),
    originalPrice: p.originalPrice != null ? toNumber(p.originalPrice) : undefined,
    currency: p.currency,
    badge: p.badge ?? undefined,
    inStock: p.inStock,
    rating: toNumber(p.rating),
    reviewCount: p.reviewCount,
    videoUrl: p.videoUrl ?? undefined,
    images: p.images.map((i) => i.url),
    specs: p.specs,
    colors: p.colors,
  };
}

const productInclude = {
  category: { select: { slug: true, name: true } },
  images: { orderBy: { sortOrder: "asc" }, select: { url: true } },
  specs: { select: { label: true, value: true } },
  colors: { select: { name: true, hex: true } },
} as const;

export const getProducts: RequestHandler = async (req, res) => {
  try {
    const categorySlug = req.query.category as string | undefined;
    const q = (req.query.q as string)?.trim()?.toLowerCase();
    const where: { category?: { slug: string }; OR?: unknown[] } = {};
    if (categorySlug) where.category = { slug: categorySlug };
    if (q) where.OR = [{ name: { contains: q, mode: "insensitive" as const } }, { slug: { contains: q, mode: "insensitive" as const } }];
    const list = await prisma.product.findMany({
      where,
      include: productInclude,
    });
    res.json({ products: list.map(productToApi), total: list.length });
  } catch (e) {
    console.error("getProducts", e);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getProductById: RequestHandler = async (req, res) => {
  try {
    const id = req.params.id;
    const product = await prisma.product.findFirst({
      where: { OR: [{ id }, { slug: id }] },
      include: productInclude,
    });
    if (!product) {
      res.status(404).json({ error: "Product not found" });
      return;
    }
    res.json(productToApi(product));
  } catch (e) {
    console.error("getProductById", e);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getCategories: RequestHandler = async (_req, res) => {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { slug: "asc" },
      include: { _count: { select: { products: true } } },
    });
    res.json(
      categories.map((c) => ({
        id: c.slug,
        name: c.name,
        slug: c.slug,
        description: c.description ?? "",
        image: c.image ?? undefined,
        productCount: c._count.products,
      }))
    );
  } catch (e) {
    console.error("getCategories", e);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getFeaturedProducts: RequestHandler = async (_req, res) => {
  try {
    const list = await prisma.product.findMany({
      where: { badge: { not: null } },
      take: 8,
      include: productInclude,
    });
    res.json({ products: list.map(productToApi), total: list.length });
  } catch (e) {
    console.error("getFeaturedProducts", e);
    res.status(500).json({ error: "Internal server error" });
  }
};
