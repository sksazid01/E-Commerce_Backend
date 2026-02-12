# API Documentation

## Base URL
```
http://localhost:3000/api/v1
```

## Authentication

Most endpoints require JWT authentication. Include the token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

---

## 📝 Authentication Endpoints

### Register User
Creates a new user account.

**Endpoint:** `POST /auth/register`

**Access:** Public

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "role": "CUSTOMER",  // Optional: "ADMIN" or "CUSTOMER" (default: "CUSTOMER")
  "firstName": "John",  // Optional
  "lastName": "Doe"     // Optional
}
```

**Response:** `201 Created`
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "role": "CUSTOMER",
      "firstName": "John",
      "lastName": "Doe",
      "createdAt": "2026-02-10T00:00:00.000Z"
    },
    "token": "jwt_token_here"
  },
  "message": "User registered successfully"
}
```

---

### Login
Authenticates a user and returns a JWT token.

**Endpoint:** `POST /auth/login`

**Access:** Public

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "role": "CUSTOMER",
      "firstName": "John",
      "lastName": "Doe"
    },
    "token": "jwt_token_here"
  },
  "message": "Login successful"
}
```

---

### Logout
Logs out the authenticated user by blacklisting their JWT token.

**Endpoint:** `POST /auth/logout`

**Access:** Private (Authenticated users)

**Headers:**
```
Authorization: Bearer <token>
```

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Logout successful"
}
```

**Error Responses:**
- `401 Unauthorized`: Invalid or missing token

**Note:** After logout, the token will be blacklisted and cannot be used for further requests.

---

## 👤 User Endpoints

### Get User Profile
Retrieves the authenticated user's profile.

**Endpoint:** `GET /users/profile`

**Access:** Private (Authenticated users)

**Headers:**
```
Authorization: Bearer <token>
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "email": "user@example.com",
    "role": "CUSTOMER",
    "firstName": "John",
    "lastName": "Doe",
    "cancelledOrdersCount": 0,
    "isBlocked": false,
    "createdAt": "2026-02-10T00:00:00.000Z"
  }
}
```

---

## 🛍️ Product Endpoints

### Get All Products
Retrieves a paginated list of products.

**Endpoint:** `GET /products`

**Access:** Public

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)

**Example:** `GET /products?page=1&limit=20`

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "products": [
      {
        "id": "uuid",
        "name": "Laptop",
        "description": "High-performance laptop",
        "price": "999.99",
        "stock": 50,
        "imageUrl": "https://example.com/laptop.jpg",
        "createdAt": "2026-02-10T00:00:00.000Z",
        "updatedAt": "2026-02-10T00:00:00.000Z"
      }
    ],
    "pagination": {
      "total": 100,
      "page": 1,
      "limit": 10,
      "totalPages": 10
    }
  }
}
```

---

### Get Product by ID
Retrieves a specific product.

**Endpoint:** `GET /products/:id`

**Access:** Public

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "Laptop",
    "description": "High-performance laptop",
    "price": "999.99",
    "stock": 50,
    "imageUrl": "https://example.com/laptop.jpg"
  }
}
```

---

### Create Product
Creates a new product (Admin only).

**Endpoint:** `POST /products`

**Access:** Private (Admin only)

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Request Body:**
```json
{
  "name": "Laptop",
  "description": "High-performance laptop",
  "price": 999.99,
  "stock": 50,
  "imageUrl": "https://example.com/laptop.jpg"  // Optional
}
```

**Response:** `201 Created`
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "Laptop",
    "description": "High-performance laptop",
    "price": "999.99",
    "stock": 50,
    "imageUrl": "https://example.com/laptop.jpg"
  },
  "message": "Product created successfully"
}
```

---

### Update Product
Updates an existing product (Admin only).

**Endpoint:** `PUT /products/:id`

**Access:** Private (Admin only)

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Request Body:** (All fields optional)
```json
{
  "name": "Updated Laptop",
  "description": "New description",
  "price": 899.99,
  "stock": 45,
  "imageUrl": "https://example.com/new-laptop.jpg"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "Updated Laptop",
    "price": "899.99",
    "stock": 45
  },
  "message": "Product updated successfully"
}
```

---

### Delete Product
Deletes a product (Admin only).

**Endpoint:** `DELETE /products/:id`

**Access:** Private (Admin only)

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Product deleted successfully"
}
```

---

## 🛒 Cart Endpoints

### Get Cart
Retrieves the authenticated user's cart.

**Endpoint:** `GET /cart`

**Access:** Private (Customer only)

**Headers:**
```
Authorization: Bearer <customer_token>
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "cart": {
      "id": "uuid",
      "userId": "uuid",
      "cartItems": [
        {
          "id": "uuid",
          "quantity": 2,
          "product": {
            "id": "uuid",
            "name": "Laptop",
            "price": "999.99",
            "stock": 50
          }
        }
      ]
    },
    "total": 1999.98,
    "itemCount": 1
  }
}
```

---

### Add to Cart
Adds an item to the cart or updates quantity if it already exists.

**Endpoint:** `POST /cart/items`

**Access:** Private (Customer only)

**Headers:**
```
Authorization: Bearer <customer_token>
```

**Request Body:**
```json
{
  "productId": "product_uuid",
  "quantity": 2
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "quantity": 2,
    "product": {
      "id": "uuid",
      "name": "Laptop",
      "price": "999.99"
    }
  },
  "message": "Item added to cart successfully"
}
```

---

### Remove from Cart
Removes an item from the cart.

**Endpoint:** `DELETE /cart/items/:productId`

**Access:** Private (Customer only)

**Headers:**
```
Authorization: Bearer <customer_token>
```

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Item removed from cart successfully"
}
```

---

### Clear Cart
Removes all items from the cart.

**Endpoint:** `DELETE /cart`

**Access:** Private (Customer only)

**Headers:**
```
Authorization: Bearer <customer_token>
```

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Cart cleared successfully"
}
```

---

## 📦 Order Endpoints

### Place Order
Creates an order from the current cart items.

**Endpoint:** `POST /orders`

**Access:** Private (Customer only)

**Headers:**
```
Authorization: Bearer <customer_token>
```

**Response:** `201 Created`
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "userId": "uuid",
    "totalAmount": "1999.98",
    "status": "PENDING",
    "orderItems": [
      {
        "id": "uuid",
        "quantity": 2,
        "price": "999.99",
        "product": {
          "id": "uuid",
          "name": "Laptop"
        }
      }
    ],
    "createdAt": "2026-02-10T00:00:00.000Z"
  },
  "message": "Order placed successfully"
}
```

---

### Get User Orders
Retrieves all orders for the authenticated user.

**Endpoint:** `GET /orders`

**Access:** Private (Authenticated users)

**Headers:**
```
Authorization: Bearer <token>
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "totalAmount": "1999.98",
      "status": "DELIVERED",
      "orderItems": [...],
      "createdAt": "2026-02-10T00:00:00.000Z"
    }
  ],
  "count": 5
}
```

---

### Get Order by ID
Retrieves a specific order.

**Endpoint:** `GET /orders/:id`

**Access:** Private (Authenticated users - own orders only)

**Headers:**
```
Authorization: Bearer <token>
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "totalAmount": "1999.98",
    "status": "PROCESSING",
    "orderItems": [
      {
        "quantity": 2,
        "price": "999.99",
        "product": {
          "name": "Laptop"
        }
      }
    ]
  }
}
```

---

### Cancel Order
Cancels a pending order and restores stock.

**Endpoint:** `PATCH /orders/:id/cancel`

**Access:** Private (Customer only - own orders)

**Headers:**
```
Authorization: Bearer <customer_token>
```

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Order cancelled successfully.",
  "data": {
    "cancelledOrdersCount": 1,
    "isBlocked": false
  }
}
```

**Note:** Users are blocked after 3 order cancellations.

---

### Update Order Status
Updates the status of an order (Admin only).

**Endpoint:** `PATCH /orders/:id/status?status=SHIPPED`

**Access:** Private (Admin only)

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Query Parameters:**
- `status`: New order status (PENDING, PROCESSING, SHIPPED, DELIVERED, CANCELLED)

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "status": "SHIPPED",
    "totalAmount": "1999.98"
  },
  "message": "Order status updated successfully"
}
```

---

## 🔴 Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "message": "Validation Error",
  "errors": [
    {
      "field": "email",
      "message": "Please provide a valid email"
    }
  ]
}
```

### 401 Unauthorized
```json
{
  "success": false,
  "message": "Invalid token"
}
```

### 403 Forbidden
```json
{
  "success": false,
  "message": "Insufficient permissions"
}
```

### 404 Not Found
```json
{
  "success": false,
  "message": "Product not found"
}
```

### 409 Conflict
```json
{
  "success": false,
  "message": "User with this email already exists"
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "message": "Internal Server Error"
}
```

---

## 📊 Order Status Flow

```
PENDING → PROCESSING → SHIPPED → DELIVERED
   ↓
CANCELLED (only from PENDING or PROCESSING)
```

**Cancellation Rules:**
- Can cancel: PENDING, PROCESSING
- Cannot cancel: SHIPPED, DELIVERED, already CANCELLED
- After 3 cancellations: User account is blocked

---

## 🔐 Role-Based Access

| Endpoint | Public | Customer | Admin |
|----------|--------|----------|-------|
| POST /auth/register | ✅ | ✅ | ✅ |
| POST /auth/login | ✅ | ✅ | ✅ |
| GET /users/profile | ❌ | ✅ | ✅ |
| GET /products | ✅ | ✅ | ✅ |
| GET /products/:id | ✅ | ✅ | ✅ |
| POST /products | ❌ | ❌ | ✅ |
| PUT /products/:id | ❌ | ❌ | ✅ |
| DELETE /products/:id | ❌ | ❌ | ✅ |
| GET /cart | ❌ | ✅ | ❌ |
| POST /cart/items | ❌ | ✅ | ❌ |
| DELETE /cart/items/:id | ❌ | ✅ | ❌ |
| DELETE /cart | ❌ | ✅ | ❌ |
| POST /orders | ❌ | ✅ | ❌ |
| GET /orders | ❌ | ✅ | ✅ |
| GET /orders/:id | ❌ | ✅ (own) | ✅ |
| PATCH /orders/:id/cancel | ❌ | ✅ (own) | ❌ |
| PATCH /orders/:id/status | ❌ | ❌ | ✅ |

---

## 💡 Testing Tips

1. **Register an Admin user first** to create products
2. **Create some products** before testing cart/orders
3. **Use different user accounts** to test customer features
4. **Test cancellation limits** by cancelling 3 orders
5. **Verify stock updates** after placing/cancelling orders

## 🛠️ Postman Collection

You can import this into Postman for easier testing. Create requests following the structure above.
