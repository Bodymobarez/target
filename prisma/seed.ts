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

  const categoryCount = await prisma.category.count();
  if (categoryCount === 0) {
    for (const c of seedCategories) {
      await prisma.category.create({
        data: { slug: c.slug, name: c.name, description: c.description ?? null, image: c.image ?? null },
      });
    }
    console.log("Categories seeded:", seedCategories.length);
  } else {
    console.log("Categories already exist:", categoryCount);
  }

  const productCount = await prisma.product.count();
  if (productCount === 0) {
    const categories = await prisma.category.findMany({ select: { id: true, slug: true } });
    const slugToId = Object.fromEntries(categories.map((c) => [c.slug, c.id]));
    for (const p of seedProducts) {
      const categoryId = slugToId[p.categorySlug];
      if (!categoryId) continue;
      await prisma.product.create({
        data: {
          slug: p.slug,
          name: p.name,
          categoryId,
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
    console.log("Products seeded:", seedProducts.length);
  } else {
    console.log("Products already exist:", productCount);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
