/**
 * Fetch products and categories from API. Fallback to mock on error/empty.
 */
import type { Product, Category } from "@shared/types";
import { products as mockProducts, categories as mockCategories, getFeaturedProducts, getProductById as getMockProductById } from "@/data/mockProducts";

const API = "/api";

export async function fetchCategories(): Promise<Category[]> {
  try {
    const res = await fetch(`${API}/categories`);
    if (!res.ok) return mockCategories;
    const data = await res.json();
    if (Array.isArray(data) && data.length > 0) return data;
    return mockCategories;
  } catch {
    return mockCategories;
  }
}

export async function fetchProducts(params?: { category?: string; q?: string }): Promise<{ products: Product[]; total: number }> {
  try {
    const search = new URLSearchParams();
    if (params?.category) search.set("category", params.category);
    if (params?.q) search.set("q", params.q);
    const res = await fetch(`${API}/products?${search.toString()}`);
    if (!res.ok) return { products: mockProducts, total: mockProducts.length };
    const data = await res.json();
    if (data?.products?.length) return { products: data.products, total: data.total ?? data.products.length };
    return { products: mockProducts, total: mockProducts.length };
  } catch {
    return { products: mockProducts, total: mockProducts.length };
  }
}

export async function fetchFeaturedProducts(): Promise<Product[]> {
  try {
    const res = await fetch(`${API}/products/featured`);
    if (!res.ok) return getFeaturedProducts();
    const data = await res.json();
    if (data?.products?.length) return data.products;
    return getFeaturedProducts();
  } catch {
    return getFeaturedProducts();
  }
}

export async function fetchProductById(id: string): Promise<Product | null> {
  try {
    const res = await fetch(`${API}/products/${encodeURIComponent(id)}`);
    if (!res.ok) return getMockProductById(id) ?? null;
    const data = await res.json();
    if (data?.id) return data;
    return getMockProductById(id) ?? null;
  } catch {
    return getMockProductById(id) ?? null;
  }
}
