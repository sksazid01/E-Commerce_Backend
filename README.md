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

## 📋 Features

### ✅ Implemented Features

- **Authentication & Authorization**
  - User registration and login
  - JWT-based authentication
  - Role-based access control (Admin/Customer)
  - Fraud prevention system (order cancellation limits)

- **Product Management** (Admin Only)
  - Create, read, update, delete products
  - Stock management with validation
  - Prevent negative inventory

- **Shopping Cart** (Customer)
  - Add items to cart
  - Remove items from cart
  - Clear cart
  - Stock availability validation

- **Order Processing** (Customer)
  - Place orders from cart
  - Transactional order creation
  - Automatic stock deduction
  - Order history
  - Order cancellation with stock restoration

- **Advanced Features**
  - Order status management (Pending, Processing, Shipped, Delivered, Cancelled)
  - Price locking at purchase time
  - Database transactions for data consistency
  - Blocked accounts after excessive cancellations
  - Admin order status updates

---

## 📐 System Architecture

See [ARCHITECTURE.md](./ARCHITECTURE.md) for detailed system design, database schema, and architectural decisions.

### Database Schema

```
User ──┐
       ├──> Cart ──> CartItem ──> Product
       └──> Order ──> OrderItem ──> Product
```

**Core Entities:**
- User (Admin/Customer roles)
- Product (with stock tracking)
- Cart & CartItem (temporary storage)
- Order & OrderItem (finalized purchases)

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
npm run start:dev
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

## 📚 API Documentation

### Interactive Documentation

Access the full Swagger documentation at: **http://localhost:3000/api/docs**

### API Endpoints Overview

#### Authentication
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/v1/auth/register` | Register new user | Public |
| POST | `/api/v1/auth/login` | Login user | Public |
| POST | `/api/v1/auth/logout` | Logout user | JWT |

#### Users
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/v1/users/profile` | Get current user profile | JWT |

#### Products
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/v1/products` | Get all products | Public |
| GET | `/api/v1/products/:id` | Get product by ID | Public |
| POST | `/api/v1/products` | Create product | Admin |
| PUT | `/api/v1/products/:id` | Update product | Admin |
| DELETE | `/api/v1/products/:id` | Delete product | Admin |

#### Cart
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/v1/cart` | Get user cart | Customer |
| POST | `/api/v1/cart/items` | Add item to cart | Customer |
| DELETE | `/api/v1/cart/items/:productId` | Remove item from cart | Customer |
| DELETE | `/api/v1/cart` | Clear cart | Customer |

#### Orders
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/v1/orders` | Place order | Customer |
| GET | `/api/v1/orders` | Get user orders | JWT |
| GET | `/api/v1/orders/:id` | Get order by ID | JWT |
| PATCH | `/api/v1/orders/:id/cancel` | Cancel order | Customer |
| PATCH | `/api/v1/orders/:id/status` | Update order status | Admin |

---

## 🔐 Authentication

All protected endpoints require a JWT token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

### Example Usage

**1. Register:**
```bash
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "Password123!",
    "role": "CUSTOMER",
    "firstName": "John",
    "lastName": "Doe"
  }'
```

**2. Login:**
```bash
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "Password123!"
  }'
```

**3. Use token in subsequent requests:**
```bash
curl http://localhost:3000/api/v1/users/profile \
  -H "Authorization: Bearer <token>"
```

---

## 🗄️ Database Schema

### User Table
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

### Product Table
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

### Cart & CartItem
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

### Order & OrderItem
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

---

## 🧪 Business Logic & Rules

### Stock Management
- ✅ Prevents orders exceeding available stock
- ✅ No negative inventory allowed
- ✅ Stock deducted atomically during order placement
- ✅ Stock restored on order cancellation

### Order Processing
- ✅ Order total calculated on backend (not trusted from client)
- ✅ Prices locked at purchase time (OrderItem stores snapshot)
- ✅ Transactional integrity (all-or-nothing operations)
- ✅ Cart cleared automatically after successful order

### Fraud Prevention
- ✅ Track cancelled orders per user
- ✅ Block user after 3 cancellations
- ✅ Blocked users cannot place new orders
- ✅ Warning message before account block

### Authorization Rules
- **Public:** Product listing, authentication endpoints
- **Customer Only:** Cart operations, order placement
- **Admin Only:** Product CRUD, order status updates
- **Authenticated:** View own orders and profile

---

## 🔧 NPM Scripts

```bash
# Development
npm run start:dev          # Start in watch mode
npm run start:debug        # Start with debugger

# Production
npm run build              # Build for production
npm run start:prod         # Start production server

# Prisma
npm run prisma:generate    # Generate Prisma client
npm run prisma:migrate     # Run migrations (dev)
npm run prisma:migrate:prod # Deploy migrations (prod)
npm run prisma:studio      # Open Prisma Studio (database GUI)

# Other
npm run format             # Format code with Prettier
npm test                   # Run tests (TBD)
```

---

## 📊 Project Structure

```
E-Commerce_backend/
├── prisma/
│   ├── schema.prisma          # Database schema
│   └── migrations/            # Migration history
├── src/
│   ├── main.ts                # Application entry point
│   ├── app.module.ts          # Root module
│   ├── common/                # Shared utilities
│   │   ├── decorators/        # Custom decorators (@CurrentUser, @Roles)
│   │   └── guards/            # Auth guards (JWT, Roles)
│   ├── config/                # Configuration
│   ├── modules/
│   │   ├── auth/              # Authentication module
│   │   ├── users/             # User management
│   │   ├── products/          # Product management
│   │   ├── cart/              # Shopping cart
│   │   └── orders/            # Order processing
│   └── prisma/                # Prisma service
├── .env                       # Environment variables
├── .env.example               # Environment template
├── nest-cli.json              # NestJS CLI config
├── tsconfig.json              # TypeScript config
├── package.json               # Dependencies
├── ARCHITECTURE.md            # System architecture docs
└── README.md                  # This file
```

---

## 🎯 Key Architectural Decisions

### 1. Modular Monolith
- **Why:** Simpler deployment, easier development for this scale
- Each module is self-contained with clear boundaries
- Easy to extract into microservices later if needed

### 2. Prisma ORM
- **Why:** Type-safe database access, excellent TypeScript support
- Auto-generated migrations
- Built-in connection pooling

### 3. Transaction Management
- **Why:** Ensures data consistency during complex operations
- Order placement uses Prisma transactions
- Stock updates and cart clearing happen atomically

### 4. Price Locking
- **Why:** Prevents price changes from affecting historical orders
- OrderItem stores price at purchase time
- Product price changes don't affect past orders

### 5. JWT Authentication
- **Why:** Stateless, scalable authentication
- No server-side session storage needed
- Token contains user ID and role for quick authorization

---

## 🔮 Assumptions

1. **Currency:** All prices in USD (single currency)
2. **Stock Units:** Integer quantities only
3. **Email Verification:** Not required (simplified for MVP)
4. **Payment Gateway:** Simulated (no real payment integration)
5. **Shipping:** Single shipping method (not implemented)
6. **Tax Calculation:** Not included (can be added later)
7. **Cart Persistence:** Cart persists across user sessions
8. **Product Variants:** Not supported (e.g., size, color)
9. **File Uploads:** Product images via URLs only (no file upload)
10. **Concurrency:** Handled via database transactions

---

## 🚧 Future Enhancements

- [ ] Unit and integration tests
- [ ] Product search and filtering
- [ ] Product categories/tags
- [ ] User address management
- [ ] Multiple shipping addresses
- [ ] Order tracking and notifications
- [ ] Email notifications (order confirmation, shipping updates)
- [ ] Payment gateway integration
- [ ] Product reviews and ratings
- [ ] Wishlist functionality
- [ ] Admin dashboard
- [ ] Sales analytics
- [ ] Inventory alerts
- [ ] Product image uploads
- [ ] API rate limiting
- [ ] Redis caching for product catalog

---

## 🐛 Troubleshooting

### Database Connection Issues

```bash
# Check if PostgreSQL is running
sudo systemctl status postgresql

# Check connection
psql -U postgres -h localhost
```

### Prisma Client Issues

```bash
# Regenerate client
npm run prisma:generate

# Reset database (WARNING: deletes all data)
npx prisma migrate reset
```

### Port Already in Use

```bash
# Change PORT in .env file
PORT=3001
```

---

## 📝 Environment Variables

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `DATABASE_URL` | PostgreSQL connection string | - | ✅ |
| `JWT_SECRET` | Secret key for JWT signing | - | ✅ |
| `JWT_EXPIRATION` | Token expiration time | 7d | ❌ |
| `PORT` | Application port | 3000 | ❌ |
| `NODE_ENV` | Environment mode | development | ❌ |
| `API_PREFIX` | API route prefix | api/v1 | ❌ |

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the ISC License.

---

## 👤 Author

**Your Name**
- GitHub: [@yourusername](https://github.com/yourusername)

---

## 🙏 Acknowledgments

- [NestJS](https://nestjs.com/) - Progressive Node.js framework
- [Prisma](https://www.prisma.io/) - Next-generation ORM
- [PostgreSQL](https://www.postgresql.org/) - Powerful open-source database
- [Swagger](https://swagger.io/) - API documentation

---

## 📞 Support

For questions or issues, please open an issue on GitHub or contact [your-email@example.com](mailto:your-email@example.com)

---

**⭐ Star this repository if you find it helpful!**
