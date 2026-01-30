/**
 * Shared e-commerce types for products, cart, orders, users
 */

export type ProductCategoryId =
  | "iphone"
  | "ipad"
  | "macbook-m1"
  | "macbook-m2"
  | "macbook-m3"
  | "macbook-m4"
  | "macbook-m5"
  | "imac"
  | "mac-mini"
  | "mac-studio"
  | "mac-pro"
  | "watch"
  | "airpods"
  | "appletv"
  | "accessories"
  | "repair";

export interface ProductSpec {
  label: string;
  value: string;
}

export interface ProductColor {
  name: string;
  hex: string;
}

/** Product condition: New or Used */
export type ProductCondition = "NEW" | "USED";

export interface Product {
  id: string;
  slug: string;
  name: string;
  categoryId: ProductCategoryId;
  categoryName: string;
  subcategory?: string;
  /** NEW = جديد، USED = مستعمل */
  condition?: ProductCondition;
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

/** Per-section design & content (controlled from backend) */
export interface SectionConfig {
  title?: string;
  subtitle?: string;
  primaryButtonText?: string;
  secondaryButtonText?: string;
  placeholder?: string;
  buttonText?: string;
  backgroundColor?: string;
  backgroundImage?: string;
  textColor?: string;
  accentColor?: string;
  paddingTop?: string;
  paddingBottom?: string;
  /** Hero: slide image URLs (one per line or array) */
  slideImages?: string[] | string;
  /** Featured: max products to show */
  maxItems?: number;
}

/** Home layout section with optional design/content config */
export interface HomeLayoutSection {
  id: string;
  enabled: boolean;
  order: number;
  config?: SectionConfig;
}

/** Global site theme (colors, font) */
export interface SiteTheme {
  primaryColor?: string;
  accentColor?: string;
  fontFamily?: string;
}
