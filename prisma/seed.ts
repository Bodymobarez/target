import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { seedCategories, seedProducts } from "./seed-data";

const prisma = new PrismaClient();

async function main() {
  const adminEmail = process.env.ADMIN_EMAIL ?? "admin@target.com";
  const adminPassword = process.env.ADMIN_PASSWORD ?? "admin123";
  const existingAdmin = await prisma.user.findFirst({ where: { role: "ADMIN" } });
  if (!existingAdmin) {
    const hash = await bcrypt.hash(adminPassword, 10);
    await prisma.user.upsert({
      where: { email: adminEmail },
      create: { email: adminEmail, passwordHash: hash, name: "Admin", role: "ADMIN" },
      update: { passwordHash: hash, role: "ADMIN" },
    });
    console.log("Admin user created:", adminEmail);
  } else {
    console.log("Admin user already exists:", existingAdmin.email);
  }

  for (const c of seedCategories) {
    await prisma.category.upsert({
      where: { slug: c.slug },
      create: { slug: c.slug, name: c.name, description: c.description ?? null, image: c.image ?? null },
      update: { name: c.name, description: c.description ?? null, image: c.image ?? null },
    });
  }
  console.log("Categories seeded/updated:", seedCategories.length);

  const defaultHomeLayout = {
    sections: [
      { id: "hero", enabled: true, order: 0, config: {} },
      { id: "categories", enabled: true, order: 1, config: {} },
      { id: "featured", enabled: true, order: 2, config: {} },
      { id: "newsletter", enabled: true, order: 3, config: {} },
    ],
  };
  await prisma.siteSetting.upsert({
    where: { key: "home_layout" },
    create: { key: "home_layout", value: defaultHomeLayout },
    update: {},
  });
  await prisma.siteSetting.upsert({
    where: { key: "site_theme" },
    create: { key: "site_theme", value: { primaryColor: "", accentColor: "", fontFamily: "" } },
    update: {},
  });

  const warehouseCount = await prisma.warehouse.count();
  if (warehouseCount === 0) {
    await prisma.warehouse.createMany({
      data: [
        { name: "المخزن الرئيسي", code: "MAIN", address: "القاهرة" },
        { name: "مخزن التوصيل", code: "SHIP", address: "الإسكندرية" },
      ],
    });
    console.log("Warehouses seeded: 2");
  }

  const categories = await prisma.category.findMany({ select: { id: true, slug: true } });
  const slugToId = Object.fromEntries(categories.map((c) => [c.slug, c.id]));

  for (const p of seedProducts) {
    const categoryId = slugToId[p.categorySlug];
    if (!categoryId) continue;

    const existing = await prisma.product.findUnique({ where: { slug: p.slug } });
    const condition = (p as { condition?: "NEW" | "USED" }).condition ?? "NEW";
    if (existing) {
      await prisma.product.update({
        where: { slug: p.slug },
        data: {
          name: p.name,
          categoryId,
          subcategory: (p as { subcategory?: string }).subcategory ?? null,
          condition,
          description: p.description,
          shortDescription: p.shortDescription ?? null,
          price: p.price,
          currency: p.currency,
          badge: p.badge ?? null,
          inStock: p.inStock,
          stockQuantity: 99,
          rating: p.rating,
          reviewCount: p.reviewCount,
        },
      });
      await prisma.productImage.deleteMany({ where: { productId: existing.id } });
      await prisma.productSpec.deleteMany({ where: { productId: existing.id } });
      await prisma.productColor.deleteMany({ where: { productId: existing.id } });
      await prisma.productImage.createMany({
        data: p.images.map((url, i) => ({ productId: existing.id, url, sortOrder: i })),
      });
      await prisma.productSpec.createMany({
        data: p.specs.map((s) => ({ productId: existing.id, label: s.label, value: s.value })),
      });
      await prisma.productColor.createMany({
        data: p.colors.map((c) => ({ productId: existing.id, name: c.name, hex: c.hex })),
      });
    } else {
      await prisma.product.create({
        data: {
          slug: p.slug,
          name: p.name,
          categoryId,
          subcategory: (p as { subcategory?: string }).subcategory ?? null,
          condition,
          description: p.description,
          shortDescription: p.shortDescription ?? null,
          price: p.price,
          currency: p.currency,
          badge: p.badge ?? null,
          inStock: p.inStock,
          stockQuantity: 99,
          rating: p.rating,
          reviewCount: p.reviewCount,
          images: { create: p.images.map((url, i) => ({ url, sortOrder: i })) },
          specs: { create: p.specs },
          colors: { create: p.colors },
        },
      });
    }
  }
  console.log("Products seeded/updated:", seedProducts.length);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
