# 🛍️ E-Commerce REST API

A comprehensive Node.js E-commerce REST API built with Express.js, PostgreSQL/Sequelize, JWT authentication, Cloudinary image upload, and Swagger documentation.

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Installation](#installation)
- [Environment Variables](#environment-variables)
- [API Documentation](#api-documentation)
- [API Endpoints](#api-endpoints)
- [Testing](#testing)
- [Database Schema](#database-schema)
- [Deployment](#deployment)

## ✨ Features

- **🔐 JWT Authentication & Authorization** - Secure login/register with role-based access
- **📦 Product Management** - Full CRUD operations with Cloudinary image upload
- **📂 Category Management** - Organize products by categories
- **🔍 Advanced Product Filtering** - By category, price range, search, and pagination
- **🛒 Shopping Cart with Persistent Pricing** - Maintains price at time of addition
- **📦 Order Management** - Complete order processing with stock validation
- **☁️ Cloudinary Integration** - Secure image upload and management
- **📚 Swagger Documentation** - Comprehensive API documentation
- **🧪 Automated Testing** - Jest tests for critical functionality
- **🔒 Security Best Practices** - Helmet, CORS, input validation, password hashing

## 🛠 Tech Stack

- **Backend**: Node.js, Express.js
- **Database**: PostgreSQL with Sequelize ORM
- **Authentication**: JWT (JSON Web Tokens)
- **File Uploads**: Multer + Cloudinary
- **Input Validation**: express-validator
- **API Documentation**: Swagger
- **Testing**: Jest + Supertest
- **Security**: Helmet, CORS, bcryptjs

## 🚀 Installation

### Prerequisites
- Node.js (v14 or higher)
- PostgreSQL (or SQLite for development)
- npm or yarn

### Step-by-Step Setup

1. **Clone the repository**
```bash
git clone <repository-url>
cd ecommerce-api
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**
```bash
cp .env.example .env
```
Edit `.env` file with your configuration.

4. **Set up database**
```bash
# For PostgreSQL (create database first)
createdb ecommerce_db

# Or use SQLite (no setup required)
# Update DB_DIALECT=sqlite in .env
```

5. **Sync database and create seed data**
```bash
npm run db:sync
```

6. **Start the development server**
```bash
npm run dev
```

The API will be running on `http://localhost:3000`

## 🔧 Environment Variables

Create a `.env` file in the root directory:

```env
# Application
NODE_ENV=development
PORT=3000

# Database (PostgreSQL)
DB_HOST=localhost
DB_PORT=5432
DB_NAME=ecommerce_db
DB_USER=postgres
DB_PASSWORD=password

# Database (SQLite - Alternative)
DB_DIALECT=sqlite
DB_STORAGE=./database.sqlite

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret