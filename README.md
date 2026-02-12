# Mini E-Commerce Backend API

A robust backend system for an e-commerce platform built with **NestJS**, **PostgreSQL**, and **Prisma ORM**. Features secure authentication, role-based access control, product management, shopping cart, and order processing with transactional integrity.

---

## 🚀 Tech Stack

| Technology | Purpose |
|------------|---------|
| **NestJS** | Core backend framework |
| **TypeScript** | Programming language |
| **PostgreSQL** | Database engine (local) |
| **Prisma** | ORM for type-safe database access |
| **Swagger** | API documentation (OpenAPI) |
| **JWT** | Authentication & authorization |
| **Bcrypt** | Password hashing |

**Architecture:** Modular Monolith

---

## �️ Database Schema / ER Diagram

### Entity Relationship Diagram

```
User ──┐
       ├──> Cart ──> CartItem ──> Product
       └──> Order ──> OrderItem ──> Product

TokenBlacklist (stores revoked JWT tokens)
```

### Core Entities

- **User:** Admin/Customer roles with fraud prevention tracking
- **Product:** Stock tracking and price management
- **Cart & CartItem:** Temporary storage for shopping session
- **Order & OrderItem:** Finalized purchases with price locking
- **TokenBlacklist:** Logout/token revocation for secure sessions

### Detailed Schema

**User Table**
```typescript
{
  id: string (UUID)
  email: string (unique)
  password: string (hashed)
  role: Role (ADMIN | CUSTOMER)
  firstName?: string
  lastName?: string
  cancelledOrdersCount: number
  isBlocked: boolean
  createdAt: datetime
  updatedAt: datetime
}
```

**Product Table**
```typescript
{
  id: string (UUID)
  name: string
  description?: string
  price: Decimal
  stock: number
  imageUrl?: string
  createdAt: datetime
  updatedAt: datetime
}
```

**Cart & CartItem**
```typescript
Cart {
  id: string (UUID)
  userId: string (FK)
  createdAt: datetime
  updatedAt: datetime
}

CartItem {
  id: string (UUID)
  cartId: string (FK)
  productId: string (FK)
  quantity: number
  createdAt: datetime
  updatedAt: datetime
}
```

**Order & OrderItem**
```typescript
Order {
  id: string (UUID)
  userId: string (FK)
  totalAmount: Decimal
  status: OrderStatus (PENDING | PROCESSING | SHIPPED | DELIVERED | CANCELLED)
  createdAt: datetime
  updatedAt: datetime
}

OrderItem {
  id: string (UUID)
  orderId: string (FK)
  productId: string (FK)
  quantity: number
  price: Decimal (locked at order time)
  createdAt: datetime
}
```

**TokenBlacklist**
```typescript
{
  id: string (UUID)
  token: string (unique)
  userId: string
  expiresAt: datetime
  createdAt: datetime
}
```

---

## 🛠️ Setup Instructions

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- PostgreSQL (v12 or higher)
- Git

### 1. Clone the Repository

```bash
git clone <repository-url>
cd E-Commerce_backend
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Database Setup

**Create PostgreSQL Database:**

```bash
# Using psql
createdb ecommerce_db

# Or using PostgreSQL client
psql -U postgres
CREATE DATABASE ecommerce_db;
```

### 4. Environment Configuration

Copy `.env.example` to `.env` and update values:

```bash
cp .env.example .env
```

Update `.env` with your configuration:

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/ecommerce_db"

# JWT
JWT_SECRET="your-super-secret-jwt-key-change-this"
JWT_EXPIRATION="7d"

# App
PORT=3000
NODE_ENV=development
API_PREFIX="api/v1"
```

### 5. Run Database Migrations

```bash
npm run prisma:migrate
```

### 6. Generate Prisma Client

```bash
npm run prisma:generate
```

### 7. Start the Application

**Development mode (with hot reload):**
```bash
npm run dev
```

**Production mode:**
```bash
npm run build
npm run start:prod
```

The API will be available at:
- **API:** `http://localhost:3000/api/v1`
- **Swagger Docs:** `http://localhost:3000/api/docs`

---

## 🎯 Key Architectural Decisions

### 1. Modular Monolith Architecture
- **Why:** Simpler deployment, easier development for this scale
- Each module is self-contained with clear boundaries
- Easy to extract into microservices later if needed
- Reduces operational complexity while maintaining code organization

### 2. Prisma ORM
- **Why:** Type-safe database access, excellent TypeScript support
- Auto-generated migrations for version control
- Built-in connection pooling for performance
- Intuitive query API reduces boilerplate code

### 3. Transaction Management
- **Why:** Ensures data consistency during complex operations
- Order placement uses Prisma transactions
- Stock updates and cart clearing happen atomically
- Prevents race conditions in concurrent operations

### 4. Price Locking in Orders
- **Why:** Prevents price changes from affecting historical orders
- OrderItem stores price at purchase time
- Product price changes don't affect past orders
- Maintains accurate financial records

### 5. JWT Authentication with Token Blacklist
- **Why:** Stateless, scalable authentication with logout capability
- No server-side session storage needed for active sessions
- Token contains user ID and role for quick authorization
- Blacklist table enables true logout (token revocation)
- Expired tokens automatically cleaned up based on expiration time

---

## 🔮 Assumptions

1. **Currency:** All prices are in USD (single currency system)
2. **Stock Units:** Product quantities are integer values only
3. **Email Verification:** Not required for user registration (simplified for MVP)
4. **Payment Gateway:** Payment processing is simulated (no real payment integration)
5. **Shipping:** Single shipping method assumed (not implemented in current version)
6. **Tax Calculation:** Not included in order totals (can be added later)
7. **Cart Persistence:** Shopping cart persists across user sessions
8. **Product Variants:** Not supported (e.g., different sizes, colors)
9. **File Uploads:** Product images are stored as URLs only (no file upload mechanism)
10. **Concurrency Handling:** Managed via database transactions and optimistic locking

---

**API Documentation:** Access interactive Swagger docs at `http://localhost:3000/api/docs` after starting the server.
