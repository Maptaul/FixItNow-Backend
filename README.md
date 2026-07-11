# FixItNow 🔧 — Home Service Platform (Backend)

A REST API for a home-services marketplace. Customers browse services and book
qualified technicians, pay via **Stripe**, track bookings and leave reviews.
Technicians manage their profile, availability and jobs. Admins manage users,
bookings and service categories.

Assignment 4 — Programming Hero Level 2.

---

## 🔑 Admin Credentials

```
Email    : admin@fixitnow.com
Password : admin123
```

Created by the seed script (`npm run seed`).

---

## 🛠️ Tech Stack

| Tech | Purpose |
|------|---------|
| Node.js + Express 5 | REST API |
| TypeScript (strict) | Type safety |
| PostgreSQL + Prisma 7 (`@prisma/adapter-pg`) | Database + ORM |
| JWT + bcryptjs | Auth + password hashing |
| Zod | Request validation |
| Stripe | Payment integration |

---

## ✨ Features

- **Roles**: Customer, Technician, Admin (chosen at registration; Admin is seeded).
- **Public**: browse services & technicians with filters (category, location, price, rating), view technician profiles with reviews.
- **Customer**: register/login, book a technician, pay with Stripe, track bookings, cancel (before it starts), leave a review after completion.
- **Technician**: manage profile & availability, create/update/delete services, accept/decline/progress/complete bookings.
- **Admin**: list & ban/unban users, view all bookings, manage service categories.
- **Consistent responses**: success `{ success, message, data }`, error `{ success, message, errorDetails }`.
- **Booking lifecycle**: `REQUESTED → ACCEPTED → PAID → IN_PROGRESS → COMPLETED` (or `DECLINED` / `CANCELLED`).

---

## 🚀 Setup

```bash
# 1. Install
npm install

# 2. Configure environment
cp .env.example .env          # then fill in DATABASE_URL, JWT secrets, Stripe keys

# 3. Apply the database schema
npx prisma migrate deploy     # or: npx prisma migrate dev

# 4. Seed the admin user + categories
npm run seed

# 5. Run
npm run dev                   # dev (tsx watch)
# npm run build && npm start  # production
```

Server starts at `http://localhost:5000`.

### Scripts

| Script | Does |
|--------|------|
| `npm run dev` | Start with hot reload |
| `npm run build` | Compile TypeScript to `dist/` |
| `npm start` | Run compiled build |
| `npm run seed` | Seed admin + categories |

---

## 📚 API Endpoints

Base URL: `http://localhost:5000`

### Auth
| Method | Endpoint | Access |
|--------|----------|--------|
| POST | `/api/auth/register` | Public (role: CUSTOMER \| TECHNICIAN) |
| POST | `/api/auth/login` | Public |
| GET | `/api/auth/me` | Any logged-in |
| PUT | `/api/auth/my-profile` | Any logged-in |

### Public
| Method | Endpoint |
|--------|----------|
| GET | `/api/categories` |
| GET | `/api/services` (filters: `categoryId, location, minPrice, maxPrice, minRating, search, page, limit`) |
| GET | `/api/technicians` (filters: `location, minRating, categoryId, page, limit`) |
| GET | `/api/technicians/:id` |

### Customer — Bookings
| Method | Endpoint |
|--------|----------|
| POST | `/api/bookings` |
| GET | `/api/bookings` |
| GET | `/api/bookings/:id` |
| PATCH | `/api/bookings/:id/cancel` |

### Customer — Payments (Stripe)
| Method | Endpoint | Notes |
|--------|----------|-------|
| POST | `/api/payments/create` | Checkout session for an ACCEPTED booking |
| POST | `/api/payments/confirm` | Verify session → mark booking PAID |
| GET | `/api/payments` | Payment history |
| GET | `/api/payments/:id` | Payment detail |
| POST | `/api/payments/webhook` | Stripe webhook (raw body) |

### Customer — Reviews
| Method | Endpoint | Notes |
|--------|----------|-------|
| POST | `/api/reviews` | Only own, COMPLETED booking, once |

### Technician
| Method | Endpoint |
|--------|----------|
| PUT | `/api/technician/profile` |
| PUT | `/api/technician/availability` |
| POST | `/api/technician/services` |
| PUT | `/api/technician/services/:id` |
| DELETE | `/api/technician/services/:id` |
| GET | `/api/technician/bookings` |
| PATCH | `/api/technician/bookings/:id` |

### Admin
| Method | Endpoint |
|--------|----------|
| GET | `/api/admin/users` (filters: `role, status`) |
| PATCH | `/api/admin/users/:id` (ban/unban) |
| GET | `/api/admin/bookings` |
| GET | `/api/admin/categories` |
| POST | `/api/admin/categories` |
| PUT | `/api/admin/categories/:id` |
| DELETE | `/api/admin/categories/:id` |

---

## 🧪 API Documentation (Postman)

Import `postman/FixItNow.postman_collection.json` into Postman.

- Run a **Login** request first — it auto-saves `accessToken`.
- Use **Login (Admin)** / **Login (Technician)** for those roles.
- Create requests auto-save ids (`categoryId`, `serviceId`, `bookingId`, `sessionId`, …).

### Testing a Stripe payment
1. Booking must be `ACCEPTED` (technician accepts it).
2. `POST /api/payments/create` → open the returned `checkoutUrl` in a browser.
3. Pay with test card `4242 4242 4242 4242`, any future expiry + any CVC.
4. `POST /api/payments/confirm` with the `sessionId` → booking becomes `PAID`.

---

## 📦 Submission

```
Backend Repo   : https://github.com/<username>/fixitnow-backend
Live API       : https://<your-app>.onrender.com
API Docs       : postman/FixItNow.postman_collection.json (or published link)
Admin Email    : admin@fixitnow.com
Admin Password : admin123
```
