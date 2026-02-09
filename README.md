# E-Commerce Backend

A backend API for e-commerce platform built with **NestJS**, **TypeScript**, **PostgreSQL**, and **Prisma ORM**.

## 🚀 Tech Stack

- **NestJS** - Progressive Node.js framework
- **TypeScript** - Type-safe JavaScript
- **PostgreSQL** - Relational database
- **Prisma** - Modern ORM
- **Swagger** - API documentation
- **JWT** - Authentication

## 📋 Prerequisites

- Node.js (v18+)
- npm or yarn
- PostgreSQL (v12+)

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd E-Commerce_backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment**
   ```bash
   cp .env.example .env
   ```
   
   Update `.env` with your database credentials:
   ```env
   DATABASE_URL="postgresql://username:password@localhost:5432/ecommerce_db"
   JWT_SECRET="your-secret-key"
   PORT=3000
   ```

4. **Generate Prisma Client**
   ```bash
   npm run prisma:generate
   ```

5. **Run database migrations**
   ```bash
   npm run prisma:migrate
   ```

## 🚀 Running the Application

**Development mode:**
```bash
npm run start:dev
```

**Production mode:**
```bash
npm run build
npm run start:prod
```

The API will be available at:
- API: `http://localhost:3000/api/v1`
- Swagger Docs: `http://localhost:3000/api/docs`

## 📦 Available Scripts

```bash
npm run build              # Build the project
npm run start              # Start the application
npm run start:dev          # Start in watch mode
npm run start:prod         # Start production
npm run prisma:generate    # Generate Prisma client
npm run prisma:migrate     # Run migrations
npm run prisma:studio      # Open Prisma Studio
```

## 📄 Database Schema

See `prisma/schema.prisma` for the complete database schema.

## 📚 API Documentation

Once the application is running, access the interactive Swagger documentation at:
```
http://localhost:3000/api/docs
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📝 License

ISC
