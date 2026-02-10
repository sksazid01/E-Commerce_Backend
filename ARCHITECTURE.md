# System Architecture - Mini E-Commerce API

## 🏗️ System Overview

A **Modular Monolith** backend system for e-commerce operations featuring secure authentication, role-based access control, and transactional data consistency.

### Tech Stack
- **Core Framework:** NestJS
- **Language:** TypeScript
- **Database:** PostgreSQL (Local)
- **ORM:** Prisma
- **Documentation:** Swagger (OpenAPI)
- **Architecture:** Modular Monolith

---

## 📐 Architectural Blueprint

### Modular Monolith Structure
```
src/
├── main.ts                      # Application entry point
├── app.module.ts                # Root module
├── common/                      # Shared utilities
│   ├── decorators/              # Custom decorators
│   ├── guards/                  # Auth guards
│   ├── interceptors/            # Response interceptors
│   ├── filters/                 # Exception filters
│   └── pipes/                   # Validation pipes
├── config/                      # Configuration management
│   └── configuration.ts
├── modules/
│   ├── auth/                    # Authentication module
│   │   ├── auth.module.ts
│   │   ├── auth.controller.ts
│   │   ├── auth.service.ts
│   │   ├── strategies/          # JWT strategies
│   │   └── dto/                 # DTOs
│   ├── users/                   # User management
│   │   ├── users.module.ts
│   │   ├── users.controller.ts
│   │   ├── users.service.ts
│   │   └── dto/
│   ├── products/                # Product management
│   │   ├── products.module.ts
│   │   ├── products.controller.ts
│   │   ├── products.service.ts
│   │   └── dto/
│   ├── cart/                    # Shopping cart
│   │   ├── cart.module.ts
│   │   ├── cart.controller.ts
│   │   ├── cart.service.ts
│   │   └── dto/
│   └── orders/                  # Order processing
│       ├── orders.module.ts
│       ├── orders.controller.ts
│       ├── orders.service.ts
│       └── dto/
└── prisma/                      # Prisma schema & migrations
    ├── schema.prisma
    └── migrations/
```

---

## 🗄️ Database Schema

### Entity Relationship Diagram

```
┌─────────────┐         ┌─────────────┐
│    User     │         │   Product   │
├─────────────┤         ├─────────────┤
│ id          │         │ id          │
│ email       │         │ name        │
│ password    │         │ description │
│ role        │◄───┐    │ price       │
│ createdAt   │    │    │ stock       │
│ updatedAt   │    │    │ createdAt   │
└─────────────┘    │    │ updatedAt   │
                   │    └─────────────┘
                   │           │
                   │           │
           ┌───────┴───────┐   │
           │               │   │
    ┌──────▼──────┐  ┌─────▼──────┐
    │    Cart     │  │ CartItem   │
    ├─────────────┤  ├────────────┤
    │ id          │  │ id         │
    │ userId      │  │ cartId     │
    │ createdAt   │◄─┤ productId  │
    │ updatedAt   │  │ quantity   │
    └─────────────┘  └────────────┘
           │
           │
    ┌──────▼──────┐
    │   Order     │
    ├─────────────┤
    │ id          │
    │ userId      │
    │ totalAmount │
    │ status      │
    │ createdAt   │
    │ updatedAt   │
    └─────────────┘
           │
           │
    ┌──────▼──────┐
    │ OrderItem   │
    ├─────────────┤
    │ id          │
    │ orderId     │
    │ productId   │
    │ quantity    │
    │ price       │
    └─────────────┘
```

### Prisma Schema Entities

#### User
- Represents both Admin and Customer roles
- Fields: id, email, password (hashed), role (ADMIN/CUSTOMER)
- Relations: Cart, Orders

#### Product
- Catalog items with inventory management
- Fields: id, name, description, price, stock
- Relations: CartItems, OrderItems

#### Cart
- One-to-one relationship with User
- Temporary storage before checkout
- Relations: User, CartItems

#### CartItem
- Many-to-many join between Cart and Product
- Fields: quantity
- Relations: Cart, Product

#### Order
- Finalized purchase transactions
- Fields: id, totalAmount, status, timestamps
- Relations: User, OrderItems

#### OrderItem
- Snapshot of products at purchase time
- Fields: quantity, price (locked at order time)
- Relations: Order, Product

---

## 🔐 Security Architecture

### Authentication Flow
1. User registers/logs in
2. JWT token issued (access token)
3. Token stored client-side
4. Token sent in Authorization header
5. Guards verify token and extract user data

### Authorization Strategy
- **Role-based Access Control (RBAC)**
- Guards: `@Roles('ADMIN')`, `@Roles('CUSTOMER')`
- Decorators: `@CurrentUser()` to extract user from request

### Fraud Prevention
- Track user order cancellations
- Implement cancellation limit (e.g., 3 per month)
- Block users exceeding limit from placing orders

---

## 🔄 Business Logic Flow

### Add to Cart Flow
```
Customer → Add Item → Check Stock → 
Update/Create CartItem → Return Cart
```

### Checkout Flow
```
Customer → Place Order →
├─ Validate Cart Items
├─ Check Stock Availability
├─ Start Database Transaction
│  ├─ Create Order
│  ├─ Create OrderItems
│  ├─ Deduct Stock
│  └─ Clear Cart
└─ Commit Transaction
```

### Product Stock Management
```
Admin → Update Stock →
Validate (no negative) →
Update Database
```

---

## 🎯 Key Design Decisions

### 1. Modular Monolith Architecture
- **Why:** Simpler deployment, easier development, clear module boundaries
- Each module is self-contained with its own service, controller, DTOs
- Modules communicate through well-defined service interfaces

### 2. Prisma ORM
- **Why:** Type-safe database access, auto-generated migrations, excellent TypeScript support
- Schema-first approach with `prisma.schema`
- Built-in connection pooling

### 3. Transaction Management
- Use Prisma transactions for order placement
- Ensures atomicity: all operations succeed or all fail
- Prevents race conditions in stock updates

### 4. Price Locking
- Order items store price at purchase time
- Prevents price changes from affecting historical orders

### 5. JWT Authentication
- Stateless authentication
- Tokens contain user ID and role
- No session storage needed

---

## 📊 API Design Principles

### RESTful Conventions
- `GET` - Retrieve resources
- `POST` - Create resources
- `PUT/PATCH` - Update resources
- `DELETE` - Remove resources

### Response Structure
```typescript
{
  "success": true,
  "data": { /* response data */ },
  "message": "Operation successful"
}
```

### Error Structure
```typescript
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error",
    "details": [ /* validation errors */ ]
  }
}
```

### HTTP Status Codes
- `200` - Success
- `201` - Created
- `400` - Bad Request (validation errors)
- `401` - Unauthorized
- `403` - Forbidden (role-based)
- `404` - Not Found
- `409` - Conflict (stock issues, duplicates)
- `500` - Internal Server Error

---

## 🚀 Development Roadmap

### Phase 1: Foundation Setup ✅
- [x] Initialize NestJS project
- [x] Configure TypeScript
- [x] Set up PostgreSQL connection
- [x] Configure Prisma

### Phase 2: Core Modules
- [ ] Implement User module
- [ ] Implement Auth module (registration, login, JWT)
- [ ] Create role guards and decorators

### Phase 3: Product Management
- [ ] Implement Product CRUD
- [ ] Add stock validation
- [ ] Admin-only guards

### Phase 4: Cart Operations
- [ ] Implement add to cart
- [ ] Implement remove from cart
- [ ] Cart validation logic

### Phase 5: Order Processing
- [ ] Implement order placement
- [ ] Transaction handling
- [ ] Stock deduction
- [ ] Order history

### Phase 6: Advanced Features (Bonus)
- [ ] Order status management
- [ ] Payment simulation
- [ ] Fraud prevention system
- [ ] Order cancellation with limits

### Phase 7: Testing & Documentation
- [ ] Write unit tests
- [ ] Write integration tests
- [ ] Complete Swagger documentation
- [ ] API deployment

---

## 🧪 Testing Strategy

### Unit Tests
- Service layer business logic
- Utility functions
- Guards and interceptors

### Integration Tests
- End-to-end API workflows
- Database operations
- Authentication flows

### Test Coverage Goals
- Minimum 80% code coverage
- All critical paths tested
- Edge cases covered

---

## 🔧 Configuration Management

### Environment Variables
```
DATABASE_URL=postgresql://user:password@localhost:5432/ecommerce
JWT_SECRET=your-secret-key
JWT_EXPIRATION=7d
PORT=3000
NODE_ENV=development
```

### Configuration Module
- Centralized config using `@nestjs/config`
- Type-safe configuration
- Environment-based settings

---

## 📝 Assumptions

1. **Single Currency:** All prices in USD
2. **Stock Units:** Integer quantities only
3. **User Verification:** Email verification not required (simplified)
4. **Payment:** Simulated (no actual payment gateway)
5. **Shipping:** Single shipping method
6. **Tax:** Not calculated (can be added later)
7. **Cart Persistence:** Cart persists across sessions
8. **Product Variants:** Not supported (simplified)
9. **Concurrency:** Handled via database transactions
10. **File Uploads:** Product images not implemented (URLs only)

---

## 🎯 Success Metrics

- ✅ All functional requirements met
- ✅ Data consistency maintained
- ✅ Role-based access working correctly
- ✅ Negative stock prevented
- ✅ Transaction integrity maintained
- ✅ Clean, maintainable code structure
- ✅ Comprehensive API documentation
