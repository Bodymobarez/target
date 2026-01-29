/**
 * Shared code between client and server
 */

export interface DemoResponse {
  message: string;
}

// ----- Auth -----
export type ApiRole = "CUSTOMER" | "ADMIN" | "STAFF" | "VENDOR";

export interface AuthUser {
  id: string;
  email: string;
  name: string | null;
  role: ApiRole;
}

export interface RegisterBody {
  email: string;
  password: string;
  name?: string;
}

export interface LoginBody {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: AuthUser;
  token: string;
}

export interface MeResponse {
  user: AuthUser;
}

// ----- Orders -----
export interface CreateOrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
  color?: string;
}

export interface CreateOrderBody {
  items: CreateOrderItem[];
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
  currency?: string;
  shippingAddress: Record<string, unknown>;
  paymentMethod?: string;
}

export interface OrderResponse {
  id: string;
  status: string;
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
  currency: string;
  createdAt: string;
  items: { productId: string; name: string; price: number; quantity: number; image?: string; color?: string }[];
}
