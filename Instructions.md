# Mini E-Commerce API

## 🎯 Project Overview

The **Mini E-Commerce API** is a backend system designed to simulate a basic online shopping platform. This project focuses on:
- Authentication
- Role-based access control
- Product management
- Cart operations
- Order processing

Emphasis on proper **business logic** and **data consistency**.

---

## 🚀 Functional Requirements

### 🔐 Authentication & Authorization
- **User Registration**
- **User Login**
- **Role-based access control:**
  - Admin
  - Customer
- Prevent fraudulent behavior (e.g., repeated order cancellations causing stock misuse)

### 📦 Product Management (Admin Only)
- Add new products
- Update product details
- Delete products
- Manage and update product stock

### 🛍️ Customer Features
- Add product to cart
- Remove product from cart
- Place order

---

## 🧱 Core Entities

Your system should include the following entities:

- **User**
- **Product**
- **Cart**
- **Order**
- **OrderItems**

---

## 📏 Business Rules

- ❌ Customers cannot order more than the available stock
- 💰 Order total must be calculated on the backend
- 🚫 Prevent negative inventory
- ✅ Deduct product stock only after successful order placement
- 🔒 Ensure data consistency across operations

---

## 🎁 Bonus Features (Optional)

- 💳 Payment simulation
- 📊 Order status management:
  - Pending
  - Shipped
  - Delivered
- 🔄 Database transaction handling to maintain data integrity

---

## 🧪 What This Assignment Evaluates

We will assess your ability in:

✅ Business logic implementation  
✅ Role-based authorization  
✅ Database design and relationships  
✅ Transaction management  
✅ Data consistency and integrity  
✅ Clean and maintainable backend code  

---

## 🧰 Technical Expectations

You may choose your preferred backend stack. However:

- ✅ RESTful API design is required
- ✅ Use proper HTTP status codes
- ✅ Input validation and error handling are expected
- ✅ Authentication should be secure (e.g., JWT-based)

---

## 📦 Submission Requirements

Please submit:

### Required:
1. **A public GitHub repository**
2. **A README.md** including:
   - Setup instructions
   - Tech stack used
   - Database schema / ER diagram (if available)
   - Key architectural decisions
   - Assumptions made

### Optional:
- 🌐 Live API deployment link (if deployed)
- 📄 Postman / Swagger API documentation

---