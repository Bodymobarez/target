export interface MockOrder {
  id: string;
  status: "pending" | "confirmed" | "shipped" | "delivered" | "cancelled";
  total: number;
  itemCount: number;
  createdAt: string;
  shippedAt?: string;
  trackingNumber?: string;
  trackingUrl?: string;
  items: { name: string; quantity: number; price: number; image: string }[];
}

export const mockUserOrders: MockOrder[] = [
  {
    id: "ORD-2847",
    status: "delivered",
    total: 1199,
    itemCount: 1,
    createdAt: "2025-01-25",
    shippedAt: "2025-01-26",
    trackingNumber: "1Z999AA10123456784",
    trackingUrl: "https://www.ups.com/track?tracknum=1Z999AA10123456784",
    items: [
      { name: "iPhone 15 Pro Max", quantity: 1, price: 1199, image: "https://images.unsplash.com/photo-1592286927505-1def25e5df75?w=200&h=200&fit=crop" },
    ],
  },
  {
    id: "ORD-2846",
    status: "shipped",
    total: 249,
    itemCount: 1,
    createdAt: "2025-01-24",
    shippedAt: "2025-01-28",
    trackingNumber: "1Z999AA10123456785",
    trackingUrl: "https://www.ups.com/track?tracknum=1Z999AA10123456785",
    items: [
      { name: "AirPods Pro (2nd gen)", quantity: 1, price: 249, image: "https://images.unsplash.com/photo-1624258919367-5dc28f5dc293?w=200&h=200&fit=crop" },
    ],
  },
  {
    id: "ORD-2845",
    status: "confirmed",
    total: 3499,
    itemCount: 1,
    createdAt: "2025-01-28",
    items: [
      { name: "MacBook Pro 16\"", quantity: 1, price: 3499, image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=200&h=200&fit=crop" },
    ],
  },
];
