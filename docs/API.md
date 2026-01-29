# API Documentation

Premium Apple Store – REST API overview for web and mobile clients.

## Base URL

- **Development:** `http://localhost:8080/api`
- **Production:** `https://your-domain.com/api`

## Auth

- **JWT** in header: `Authorization: Bearer <token>`
- **Refresh token** endpoint for long-lived sessions
- **Roles:** `customer` | `admin` | `staff` | `vendor`

---

## Products

### List products

```http
GET /api/products
Query: category?, minPrice?, maxPrice?, sort=price_asc|price_desc|newest, page, limit
```

**Response:** `{ products: Product[], total: number }`

### Get product by ID or slug

```http
GET /api/products/:id
```

**Response:** `Product` (with images, specs, colors, related)

### Get categories

```http
GET /api/categories
```

**Response:** `Category[]`

---

## Cart (client-side or session)

Cart can be stored in client state (as in this app) or synced to:

```http
GET    /api/cart
POST   /api/cart/items      Body: { productId, quantity, color? }
PATCH  /api/cart/items/:id  Body: { quantity }
DELETE /api/cart/items/:id
```

---

## Orders

### Create order (checkout)

```http
POST /api/orders
Body: {
  items: { productId, quantity, color? }[],
  shippingAddress: Address,
  billingAddress?: Address,
  paymentMethod: string,
  couponCode?: string
}
```

**Response:** `{ order: Order, paymentIntent?: object }`

### Get my orders

```http
GET /api/orders
Query: status?, page, limit
```

**Response:** `{ orders: Order[], total: number }`

### Get order by ID

```http
GET /api/orders/:id
```

**Response:** `Order` (with items, status, tracking)

### Cancel order

```http
POST /api/orders/:id/cancel
```

---

## Wishlist

```http
GET    /api/wishlist
POST   /api/wishlist        Body: { productId }
DELETE /api/wishlist/:productId
```

**Response:** `{ productIds: string[] }` or updated list

---

## User & Profile

```http
GET  /api/me
PATCH /api/me   Body: { name?, email? }
GET  /api/me/addresses
POST /api/me/addresses   Body: Address
```

---

## Admin (protected)

### Products CRUD

```http
GET    /api/admin/products
POST   /api/admin/products    Body: ProductCreate
GET    /api/admin/products/:id
PATCH  /api/admin/products/:id
DELETE /api/admin/products/:id
```

### Orders

```http
GET  /api/admin/orders   Query: status, page
PATCH /api/admin/orders/:id   Body: { status, trackingNumber? }
```

### Analytics (placeholder)

```http
GET /api/admin/analytics/dashboard   // sales, top products, revenue
GET /api/admin/analytics/export?format=csv|pdf
```

---

## Types (shared)

- **Product:** id, slug, name, categoryId, description, price, originalPrice, images[], specs[], colors[], rating, reviewCount, inStock, badge
- **Category:** id, slug, name, description, productCount
- **Order:** id, status, items[], subtotal, shipping, tax, total, createdAt, trackingNumber
- **Address:** line1, line2, city, state, zip, country

---

## Errors

- `400` – Validation error (body/query)
- `401` – Unauthorized (missing or invalid token)
- `403` – Forbidden (role)
- `404` – Resource not found
- `429` – Rate limit
- `500` – Server error

Response shape: `{ error: string, code?: string, details?: object }`
