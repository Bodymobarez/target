import { RequestHandler } from "express";

// In-memory mock for API (replace with DB/Prisma later)
const categories = [
  { id: "iphone", name: "iPhone", slug: "iphone", description: "Powerful. Beautiful.", productCount: 8 },
  { id: "ipad", name: "iPad", slug: "ipad", description: "Magic happens here.", productCount: 6 },
  { id: "macbook", name: "MacBook", slug: "macbook", description: "Supercharged by Apple Silicon.", productCount: 6 },
  { id: "watch", name: "Apple Watch", slug: "watch", description: "The ultimate device for a healthy life.", productCount: 4 },
  { id: "airpods", name: "AirPods", slug: "airpods", description: "Sound that surrounds you.", productCount: 4 },
  { id: "accessories", name: "Accessories", slug: "accessories", description: "Chargers, cases, MagSafe & more.", productCount: 12 },
];

const products = [
  { id: "1", slug: "iphone-15-pro-max", name: "iPhone 15 Pro Max", categoryId: "iphone", categoryName: "iPhone", price: 1199, originalPrice: 1299, rating: 4.8, reviewCount: 2543, inStock: true, badge: "New", images: ["https://images.unsplash.com/photo-1592286927505-1def25e5df75?w=800&h=800&fit=crop"], specs: [{ label: "Display", value: "6.7\" Super Retina XDR" }, { label: "Chip", value: "A17 Pro" }], colors: [{ name: "Black Titanium", hex: "#1a1a1a" }] },
  { id: "2", slug: "iphone-15-pro", name: "iPhone 15 Pro", categoryId: "iphone", categoryName: "iPhone", price: 999, originalPrice: 1099, rating: 4.7, reviewCount: 1834, inStock: true, badge: "New", images: ["https://images.unsplash.com/photo-1592286927505-1def25e5df75?w=800&h=800&fit=crop"], specs: [], colors: [] },
  { id: "3", slug: "macbook-pro-16", name: "MacBook Pro 16\"", categoryId: "macbook", categoryName: "MacBook", price: 3499, rating: 4.9, reviewCount: 1245, inStock: true, badge: "Pro", images: ["https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&h=800&fit=crop"], specs: [], colors: [] },
  { id: "8", slug: "airpods-pro-2", name: "AirPods Pro (2nd gen)", categoryId: "airpods", categoryName: "AirPods", price: 249, rating: 4.7, reviewCount: 3421, inStock: true, badge: "Best Seller", images: ["https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&h=800&fit=crop"], specs: [], colors: [] },
  { id: "9", slug: "mag-safe-charger", name: "MagSafe Charger", categoryId: "accessories", categoryName: "Accessories", price: 39, rating: 4.5, reviewCount: 4521, inStock: true, images: ["https://images.unsplash.com/photo-1583394838336-acd977736f90?w=800&h=800&fit=crop"], specs: [], colors: [] },
];

export const getProducts: RequestHandler = (req, res) => {
  const category = req.query.category as string | undefined;
  const q = (req.query.q as string)?.toLowerCase();
  let list = products;
  if (category) list = list.filter((p) => p.categoryId === category);
  if (q) list = list.filter((p) => p.name.toLowerCase().includes(q) || p.categoryName.toLowerCase().includes(q));
  res.json({ products: list, total: list.length });
};

export const getProductById: RequestHandler = (req, res) => {
  const id = req.params.id;
  const product = products.find((p) => p.id === id || p.slug === id);
  if (!product) return res.status(404).json({ error: "Product not found" });
  res.json(product);
};

export const getCategories: RequestHandler = (_req, res) => {
  res.json(categories);
};
