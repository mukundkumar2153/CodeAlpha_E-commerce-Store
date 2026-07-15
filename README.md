# CodeAlpha_Ecommerce — Advanced Full Stack E-commerce Store

CodeAlpha Full Stack Development Internship — **Task 2: Simple E-commerce Store** (built to an advanced spec).

Live demo: *add your deployed link here after hosting*

## Tech Stack

**Frontend:** React 18 + Vite, React Router v6, Axios, react-hot-toast
**Backend:** Node.js, Express.js, MongoDB (Mongoose), JWT auth, bcrypt
**Payments:** Razorpay + Cash on Delivery
**Auth:** JWT-based, role-based access control (customer / admin)

## Features

### Customer-facing
- Product catalog with search, category filter, price sort, pagination
- Product detail pages with image, stock status, and a review system (star ratings)
- Persistent server-side cart (add / update quantity / remove)
- Multi-step checkout: shipping address → payment method → Razorpay or COD
- Razorpay integration with signature verification on the backend (prevents payment spoofing)
- Order history with live status tracking (pending → processing → shipped → delivered)
- JWT auth: register, login, persistent sessions

### Admin panel (`/admin`, requires admin role)
- Dashboard with revenue, order count, product count, pending order stats
- Full product CRUD (create, edit, delete, feature toggle)
- Order management: view all orders, update fulfillment status

## Project Structure

```
CodeAlpha_Ecommerce/
├── backend/
│   ├── config/db.js            MongoDB connection
│   ├── models/                 User, Product, Order schemas
│   ├── middleware/              JWT auth guard, admin guard, error handler
│   ├── routes/                  auth, products, cart, orders (incl. Razorpay)
│   ├── seed/seedProducts.js     Seeds 8 sample products + admin account
│   └── server.js
└── frontend/
    └── src/
        ├── api/axios.js         Axios instance with auth interceptor
        ├── context/              AuthContext, CartContext
        ├── components/           Navbar, ProductCard, route guards
        └── pages/                 Home, ProductDetail, Cart, Checkout, Orders,
                                    Login, Register, admin/*
```

## Local Setup

### 1. Backend

```bash
cd backend
npm install
cp .env.example .env
# edit .env: set MONGO_URI, JWT_SECRET, RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET
npm run seed     # seeds sample products + creates admin@codealpha.tech / admin123
npm run dev      # starts on http://localhost:5000
```

Get free Razorpay **test mode** keys at https://dashboard.razorpay.com/app/keys — no real money moves in test mode.

### 2. Frontend

```bash
cd frontend
npm install
cp .env.example .env   # VITE_API_URL=http://localhost:5000/api
npm run dev             # starts on http://localhost:5173
```

### 3. Log in as admin

Use `admin@codealpha.tech` / `admin123` (created by the seed script) to access `/admin`.

## API Overview

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/register` | Public | Create account |
| POST | `/api/auth/login` | Public | Login, returns JWT |
| GET | `/api/products` | Public | List products (search/filter/sort/paginate) |
| GET | `/api/products/:slug` | Public | Product detail + reviews |
| POST | `/api/products/:id/reviews` | User | Add a review |
| POST | `/api/products` | Admin | Create product |
| PUT/DELETE | `/api/products/:id` | Admin | Update / delete product |
| GET/POST/PUT/DELETE | `/api/cart` | User | Manage cart |
| POST | `/api/orders/razorpay/create` | User | Create Razorpay order |
| POST | `/api/orders` | User | Place order (verifies Razorpay signature) |
| GET | `/api/orders/my` | User | Order history |
| GET | `/api/orders` | Admin | All orders |
| PUT | `/api/orders/:id/status` | Admin | Update order status |

## Deployment Notes

- **Backend:** Render, Railway, or Cyclic (set env vars, `MONGO_URI` from MongoDB Atlas)
- **Frontend:** Vercel or Netlify (set `VITE_API_URL` to your deployed backend URL)
- Update `CLIENT_URL` in the backend `.env` to your deployed frontend URL for CORS

## CodeAlpha Submission Checklist

- [ ] Push this repo to GitHub as `CodeAlpha_Ecommerce`
- [ ] Deploy frontend + backend, add live link to this README
- [ ] Record a short video walkthrough (catalog → cart → checkout → admin panel)
- [ ] Post on LinkedIn tagging @CodeAlpha with the video + GitHub link
- [ ] Submit via the CodeAlpha submission form
