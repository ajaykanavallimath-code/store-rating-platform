# 🌟 Store Rating Platform

A full-stack, multi-role web platform where registered shoppers can discover stores and submit verified ratings (1 to 5 stars), store owners can track customer evaluations and business analytics, and system administrators can oversee platform users, stores, and ratings.

---

## 📑 Table of Contents
1. [Overview & Role Breakdown](#1-overview--role-breakdown)
2. [Technology Stack](#2-technology-stack)
3. [Folder Structure](#3-folder-structure)
4. [Prerequisites](#4-prerequisites)
5. [Database Setup & MySQL Configuration](#5-database-setup--mysql-configuration)
6. [Environment Variables](#6-environment-variables)
7. [Installation & Quick Start](#7-installation--quick-start)
8. [Database Initialization & Idempotent Seeding](#8-database-initialization--idempotent-seeding)
9. [Automated Testing](#9-automated-testing)
10. [API Endpoint Documentation](#10-api-endpoint-documentation)
11. [Security Architecture & Validation Rules](#11-security-architecture--validation-rules)
12. [Production Build & Deployment Guide](#12-production-build--deployment-guide)
13. [Troubleshooting & FAQ](#13-troubleshooting--faq)

---

## 1. Overview & Role Breakdown

The platform provides a **single unified authentication entry point** with automatic redirection to role-tailored dashboards:

| Role | Access & Permissions |
| :--- | :--- |
| **👑 SYSTEM ADMINISTRATOR (ADMIN)** | Full platform oversight. View aggregate KPI dashboard (total users, stores, ratings, average rating), manage users directory, create accounts for any role (Admin/Owner/Shopper), view user details and owner stores, register new stores with owner assignment, and apply multi-column filters, sorting, and pagination. |
| **👤 NORMAL USER (USER)** | Publicly registered shopper account. Search stores by name and address, sort by rating and review volume, submit ratings (1 to 5 stars), update previously submitted ratings, and view personal rating history. |
| **🏪 STORE OWNER (OWNER)** | Isolated store management dashboard. Access performance metrics (average rating via SQL `AVG()`, total review count) and view a customer rating breakdown table (customer name, email, rating score, submission and update timestamps) for assigned stores only. |

---

## 2. Technology Stack

### Frontend
- **Framework**: React 18 with Vite
- **Styling**: Tailwind CSS with custom design system
- **Routing**: React Router DOM (v7) with `ProtectedRoute` and `RoleRoute` guards
- **HTTP Client**: Axios with interceptors, standard error handlers, and credential management
- **Icons**: Lucide React
- **Notifications**: React Hot Toast
- **Testing**: Vitest + React Testing Library + jsdom

### Backend
- **Runtime**: Node.js (ES Modules `"type": "module"`)
- **Web Framework**: Express.js
- **Database Engine**: MySQL with `mysql2/promise` connection pooling
- **Security**: Helmet headers, bcryptjs password hashing (cost factor 10), jsonwebtoken (JWT in HttpOnly cookies), express-rate-limit
- **Validation**: express-validator with centralized error formatting
- **Testing**: Vitest + Supertest

---

## 3. Folder Structure

```
store-rating-platform/
├── backend/
│   ├── database/
│   │   ├── schema.sql           # Database DDL schema (users, stores, ratings)
│   │   ├── initDb.js            # Automated DB creation & schema executor
│   │   └── seed.js              # Idempotent seed script with sample data
│   ├── src/
│   │   ├── config/
│   │   │   └── db.js            # mysql2/promise connection pool
│   │   ├── controllers/
│   │   │   ├── authController.js
│   │   │   ├── adminController.js
│   │   │   ├── storeController.js
│   │   │   ├── ratingController.js
│   │   │   └── ownerController.js
│   │   ├── middleware/
│   │   │   ├── authenticate.js  # JWT token verification & user loader
│   │   │   ├── authorize.js     # Role-based access control guard
│   │   │   ├── optionalAuthenticate.js
│   │   │   ├── rateLimiter.js   # Rate limiting for auth & general endpoints
│   │   │   ├── validate.js      # Central express-validator error formatter
│   │   │   ├── errorHandler.js  # Safe global error handler
│   │   │   └── notFound.js      # 404 handler
│   │   ├── routes/
│   │   │   ├── authRoutes.js
│   │   │   ├── adminRoutes.js
│   │   │   ├── storeRoutes.js
│   │   │   ├── ratingRoutes.js
│   │   │   └── ownerRoutes.js
│   │   ├── utils/
│   │   │   ├── jwt.js
│   │   │   ├── password.js
│   │   │   └── response.js      # Standard JSON response utilities
│   │   ├── validators/
│   │   │   ├── authValidators.js
│   │   │   ├── adminValidators.js
│   │   │   ├── storeValidators.js
│   │   │   └── ratingValidators.js
│   │   ├── app.js               # Express application config
│   │   └── server.js            # HTTP server startup
│   ├── tests/
│   │   ├── jwt_password.test.js
│   │   ├── validation.test.js
│   │   └── api.test.js
│   ├── .env.example
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx
│   │   │   ├── Sidebar.jsx
│   │   │   ├── StarRating.jsx
│   │   │   ├── SearchBar.jsx
│   │   │   ├── DataTable.jsx
│   │   │   ├── Pagination.jsx
│   │   │   ├── RatingModal.jsx
│   │   │   ├── FormInput.jsx
│   │   │   ├── LoadingSpinner.jsx
│   │   │   ├── ConfirmDialog.jsx
│   │   │   ├── ProtectedRoute.jsx
│   │   │   └── RoleRoute.jsx
│   │   ├── context/
│   │   │   └── AuthContext.jsx  # Authentication state & helpers
│   │   ├── layouts/
│   │   │   ├── AdminLayout.jsx
│   │   │   ├── UserLayout.jsx
│   │   │   └── OwnerLayout.jsx
│   │   ├── pages/
│   │   │   ├── Login.jsx
│   │   │   ├── Signup.jsx
│   │   │   ├── ChangePassword.jsx
│   │   │   ├── NotFound.jsx
│   │   │   ├── admin/
│   │   │   │   ├── AdminDashboard.jsx
│   │   │   │   ├── ManageUsers.jsx
│   │   │   │   ├── AddUser.jsx
│   │   │   │   ├── UserDetails.jsx
│   │   │   │   ├── ManageStores.jsx
│   │   │   │   └── AddStore.jsx
│   │   │   ├── user/
│   │   │   │   ├── UserDashboard.jsx
│   │   │   │   └── StoreDetails.jsx
│   │   │   └── owner/
│   │   │       └── OwnerDashboard.jsx
│   │   ├── services/
│   │   │   ├── api.js
│   │   │   ├── authService.js
│   │   │   ├── adminService.js
│   │   │   ├── storeService.js
│   │   │   ├── ratingService.js
│   │   │   └── ownerService.js
│   │   ├── utils/
│   │   │   ├── validation.js
│   │   │   └── formatters.js
│   │   ├── test/
│   │   │   ├── setup.js
│   │   │   ├── validation.test.js
│   │   │   ├── StarRating.test.jsx
│   │   │   ├── Login.test.jsx
│   │   │   └── Signup.test.jsx
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── .env.example
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── package.json
│
├── package.json                 # Root orchestration scripts
├── .gitignore
└── README.md
```

---

## 4. Prerequisites

Before running the application, make sure you have installed:
- **Node.js**: `v18.0.0` or higher (`v20+` recommended)
- **npm**: `v9.0.0` or higher
- **MySQL Server**: `v8.0+` (or MariaDB `v10.4+`)

---

## 5. Database Setup & MySQL Configuration

### Step 1: Start MySQL Server
Make sure your local MySQL service is running.
- **Windows**: Start via Services (`services.msc`) or XAMPP / WampServer.
- **macOS**: `brew services start mysql`
- **Linux**: `sudo systemctl start mysql`

### Step 2: Configure Database Credentials
Create or edit `backend/.env` with your MySQL connection credentials:

```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=store_rating_platform
```

### Step 3: Run Database Schema Initialization
Run the initialization command from the project root:

```bash
npm run db:init
```
*(This creates the `store_rating_platform` database if it doesn't already exist and applies `backend/database/schema.sql`).*

---

## 6. Environment Variables

### Backend (`backend/.env`)

| Variable | Description | Default / Example |
| :--- | :--- | :--- |
| `PORT` | Backend server port | `5000` |
| `NODE_ENV` | Environment mode (`development` or `production`) | `development` |
| `DB_HOST` | MySQL hostname | `localhost` |
| `DB_PORT` | MySQL port | `3306` |
| `DB_USER` | MySQL username | `root` |
| `DB_PASSWORD` | MySQL password | *(your password)* |
| `DB_NAME` | Database name | `store_rating_platform` |
| `JWT_SECRET` | Secret key for signing JWTs | `super_secret_jwt_key_store_rating_platform_2026` |
| `JWT_EXPIRES_IN` | JWT expiration duration | `1d` |
| `FRONTEND_URL` | Frontend origin for CORS | `http://localhost:5173` |
| `COOKIE_SECURE` | Set `true` in production with HTTPS | `false` |
| `ADMIN_NAME` | Initial Admin Account Full Name (20-60 chars) | `System Administrator Admin` |
| `ADMIN_EMAIL` | Initial Admin Email | `admin@storerating.com` |
| `ADMIN_PASSWORD` | Initial Admin Password (complex) | `AdminPass123!` |

### Frontend (`frontend/.env`)

| Variable | Description | Default |
| :--- | :--- | :--- |
| `VITE_API_URL` | Base Backend API URL | `http://localhost:5000/api` |

---

## 7. Installation & Quick Start

### 1. Install all dependencies
Run from the root directory:
```bash
npm run install:all
```

### 2. Seed Sample Data
Populate the database with preconfigured demo accounts, stores, and ratings:
```bash
npm run db:seed
```

### 3. Start Development Servers
Start both backend and frontend concurrently:
```bash
npm run dev
```

- **Frontend URL**: [http://localhost:5173](http://localhost:5173)
- **Backend API URL**: [http://localhost:5000/api](http://localhost:5000/api)
- **Health Check**: [http://localhost:5000/api/health](http://localhost:5000/api/health)

---

## 8. Database Initialization & Idempotent Seeding

The seed script (`backend/database/seed.js`) is completely **idempotent**. Rerunning it updates existing entities and inserts missing records without creating duplicates.

### Pre-Seeded Demo Accounts

| Role | Full Name | Email Address | Password |
| :--- | :--- | :--- | :--- |
| **👑 ADMIN** | `System Administrator Admin` | `admin@storerating.com` | `AdminPass123!` |
| **🏪 OWNER 1** | `Alexander James Owner Sr.` | `alex.owner@techsuperstore.com` | `OwnerPass123!` |
| **🏪 OWNER 2** | `Catherine Marie Owner Jr.` | `catherine.owner@greenorganic.com` | `OwnerPass123!` |
| **👤 USER 1** | `Jonathan David Doe Consumer` | `john.doe@communityreviews.org` | `UserPass123!` |
| **👤 USER 2** | `Samantha Louise Taylor User` | `samantha.taylor@shopperguide.net` | `UserPass123!` |
| **👤 USER 3** | `Michael Brandon Miller Client` | `michael.miller@globalshopper.io` | `UserPass123!` |
| **👤 USER 4** | `Eleanor Victoria Vance Buyer` | `eleanor.vance@qualityeval.com` | `UserPass123!` |

---

## 9. Automated Testing

All automated tests run via Vitest:

### Run Backend API & Unit Tests (21 tests)
```bash
npm run test:backend
```
Covers:
- Password hashing & bcrypt verification
- JWT signing, expiry, and tampered token rejection
- Field validation (Name 20-60 chars, password complexity, address <= 400, ratings 1-5 integer only)
- Public user registration vs privileged account restrictions
- Role authorization guards (401 unauthenticated, 403 unauthorized)
- 404 handler & error response structure

### Run Frontend Component & Integration Tests (22 tests)
```bash
npm run test:frontend
```
Covers:
- StarRating interactivity, readOnly mode, accessibility
- Client-side validation rules & password checklist
- Unified Login page form validation and demo pill autofill
- User registration form validation

### Run Full Test Suite (43 tests total)
```bash
npm test
```

---

## 10. API Endpoint Documentation

### Standard Response Formats

#### Success (200 / 201)
```json
{
  "success": true,
  "message": "Stores retrieved successfully.",
  "data": [ ... ],
  "pagination": {
    "total": 6,
    "page": 1,
    "limit": 10,
    "totalPages": 1
  }
}
```

#### Validation Failure (400)
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": {
    "name": "Name must be between 20 and 60 characters",
    "password": "Password must contain at least one special character"
  }
}
```

### Endpoints Matrix

| Method | Endpoint | Auth Required | Role | Description |
| :--- | :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/signup` | No | Public | Register new normal user (USER) |
| `POST` | `/api/auth/login` | No | Public | Unified login for all 3 roles |
| `GET` | `/api/auth/me` | Yes | Any | Get current session user profile |
| `POST` | `/api/auth/logout` | No | Any | Clear authentication cookie |
| `PUT` | `/api/auth/password` | Yes | Any | Change password with current password verification |
| `GET` | `/api/admin/dashboard` | Yes | `ADMIN` | Aggregate platform statistics and ratings distribution |
| `GET` | `/api/admin/users` | Yes | `ADMIN` | Search, filter, sort, and paginate user directory |
| `POST` | `/api/admin/users` | Yes | `ADMIN` | Create user of any role (`ADMIN`, `USER`, `OWNER`) |
| `GET` | `/api/admin/users/:id` | Yes | `ADMIN` | View user profile, owned stores, or rating activity |
| `GET` | `/api/admin/stores` | Yes | `ADMIN` | List all stores with owner info and rating averages |
| `POST` | `/api/admin/stores` | Yes | `ADMIN` | Create store with optional owner assignment |
| `GET` | `/api/admin/stores/:id` | Yes | `ADMIN` | View store details with all customer reviews |
| `GET` | `/api/stores` | Optional | Any | Browse stores with average ratings, rating count, and user's rating |
| `GET` | `/api/stores/:id` | Optional | Any | Store details and user submitted rating |
| `POST` | `/api/ratings` | Yes | `USER` | Submit rating (1 to 5 stars) for a store |
| `PUT` | `/api/ratings/:storeId` | Yes | `USER` | Update existing rating for a store |
| `GET` | `/api/ratings/mine` | Yes | `USER` | List all ratings submitted by current user |
| `GET` | `/api/owner/stores` | Yes | `OWNER` | List stores assigned to authenticated owner |
| `GET` | `/api/owner/dashboard` | Yes | `OWNER` | View store ratings and customer reviews table |

---

## 11. Security Architecture & Validation Rules

### Strict Validation Rules
- **Name**: 20 to 60 characters, trimmed, mandatory.
- **Address**: Required, maximum 400 characters.
- **Email**: Normalized to lowercase, trimmed, validated format, unique constraint in MySQL.
- **Password**: 8 to 16 characters with at least 1 uppercase letter, 1 lowercase letter, 1 number, and 1 special character (`[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]`).
- **Rating**: Whole integer between 1 and 5 (decimals, strings, zeros, negatives, and >5 rejected).

### Security Defenses
- **SQL Injection Prevention**: Parameterized queries across all database operations. All table sorting columns are validated against explicit strict allowlists.
- **Privilege Escalation Prevention**: Public signup endpoint hardcodes role to `USER`. Admin/Owner endpoints verify verified JWT session payload and reject unauthorized roles with `403 Forbidden`.
- **Cross-User Tampering Guard**: Rating endpoints extract `user_id` strictly from the verified JWT session, never trusting client request bodies.
- **Owner Isolation**: Store Owner endpoints check `stores.owner_id = req.user.id`, preventing owners from seeing customer data belonging to other businesses.
- **Cookie Security**: `HttpOnly`, `SameSite=Lax`, and `Secure` (production) cookies prevent XSS credential theft.

---

## 12. Production Build & Deployment Guide

### Frontend Build
To test or create the production build:
```bash
npm run build:frontend
```
The optimized assets will be emitted to `frontend/dist/`.

### Deployment Steps:
1. **Frontend (Vercel / Netlify)**:
   - Root directory: `frontend`
   - Build command: `npm run build`
   - Output directory: `dist`
   - Set environment variable: `VITE_API_URL=https://your-backend-api.com/api`
2. **Backend (Render / Railway / Heroku)**:
   - Root directory: `backend`
   - Start command: `node src/server.js`
   - Set environment variables (`DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`, `JWT_SECRET`, `FRONTEND_URL`, `COOKIE_SECURE=true`, `NODE_ENV=production`).
3. **Managed Database (Aiven / PlanetScale / AWS RDS)**:
   - Connect to the cloud MySQL instance, run `npm run db:init` and `npm run db:seed`.

---

## 13. Troubleshooting & FAQ

#### Q: "Connection Error: connect ECONNREFUSED 127.0.0.1:3306"
- **Solution**: Your MySQL server is not running or the port in `backend/.env` (`DB_PORT`) is incorrect. Start MySQL and recheck credentials in `backend/.env`.

#### Q: "An account with this email address already exists"
- **Solution**: Emails must be unique. Choose a different email address or log in with the existing account.

#### Q: "Access denied. Required role: ADMIN. Your role: USER"
- **Solution**: You are logged in with a normal shopper account. Sign out and sign in with an Admin account (`admin@storerating.com`).

---

## 📜 License
This project is licensed under the ISC License.
