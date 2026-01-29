/**
 * Shared e-commerce types for products, cart, orders, users
 */

export type ProductCategoryId =
  | "iphone"
  | "ipad"
  | "macbook"
  | "imac"
  | "watch"
  | "airpods"
  | "appletv"
  | "accessories";

export interface ProductSpec {
  label: string;
  value: string;
}

export interface ProductColor {
  name: string;
  hex: string;
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  categoryId: ProductCategoryId;
  categoryName: string;
  subcategory?: string;
  description: string;
  shortDescription: string;
  price: number;
  originalPrice?: number;
  currency: string;
  images: string[];
  thumbnails?: string[];
  rating: number;
  reviewCount: number;
  specs: ProductSpec[];
  colors: ProductColor[];
  inStock: boolean;
  badge?: "New" | "Pro" | "Best Seller" | "Limited" | "Latest" | "Premium";
  accessories?: string[]; // product ids
  videoUrl?: string;
}

export interface Category {
  id: ProductCategoryId;
  name: string;
  slug: string;
  description: string;
  image?: string;
  productCount: number;
}

export interface CartItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  color?: string;
}

export interface Order {
  id: string;
  status: "pending" | "confirmed" | "shipped" | "delivered" | "cancelled";
  items: CartItem[];
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
  createdAt: string;
  shippedAt?: string;
  trackingNumber?: string;
}

export interface User {
  id: string;
  email: string;
  name?: string;
  role: "customer" | "admin" | "vendor";
}
