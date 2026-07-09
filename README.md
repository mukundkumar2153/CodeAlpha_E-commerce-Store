# Wax & Wire — Vinyl Record Store

A full-stack e-commerce project: product catalog, product detail pages, a shopping cart,
user registration/login, and order processing — with a custom vinyl-record-shop design
(no generic Bootstrap look).

## Stack

- **Backend:** Node.js + Express, SQLite (via `better-sqlite3`), JWT auth in an httpOnly
  cookie, `bcryptjs` for password hashing.
- **Frontend:** Plain HTML/CSS/JavaScript (no framework/build step needed) — served
  directly by Express as static files.
- **Database:** SQLite file (`backend/store.db`), auto-created and seeded with 12 sample
  products the first time you run the server.

## Project structure

```
wax-and-wire/
├── backend/
│   ├── server.js      # Express app + all API routes
│   ├── db.js          # SQLite schema (users, products, cart_items, orders, order_items)
│   ├── seed.js         # Seeds sample products on first run
│   ├── auth.js         # JWT signing/verification helpers
│   └── package.json
└── public/              # Frontend (served as static files by Express)
    ├── index.html       # Home page + product catalog with search/filter
    ├── product.html      # Product detail page
    ├── cart.html          # Cart + checkout form
    ├── login.html / register.html
    ├── orders.html        # Order confirmation + order history
    ├── css/style.css
    └── js/                # api.js (shared fetch helper) + one script per page
```

## Setup

```bash
cd backend
npm install
npm start
```

Then open **http://localhost:3000** in your browser. That's it — frontend and backend
run from the same server and port.

The database (`backend/store.db`) is created and seeded automatically the first time
you start the server. To reset everything, just delete `backend/store.db*` and restart.

## Features implemented

- **Product listings** — home page grid with category filter chips and a search box
  (matches title or artist), pulled live from `GET /api/products`.
- **Product details page** — `product.html?id=<id>`, with quantity selector, stock
  status, and "Add to crate."
- **Shopping cart** — works for guests (tracked via an anonymous cookie) and for signed-in
  users; add/update quantity/remove; a guest's cart is automatically merged into their
  account the moment they log in or register.
- **User registration/login** — `POST /api/auth/register` and `/api/auth/login`, passwords
  hashed with bcrypt, session kept in a signed JWT stored in an httpOnly cookie (no
  client-side token handling needed).
- **Order processing** — checkout requires sign-in; placing an order snapshots cart items
  into `orders`/`order_items`, decrements stock, empties the cart, and redirects to an
  order confirmation + order history page.
- **Database** — five tables (`users`, `products`, `cart_items`, `orders`, `order_items`)
  with foreign keys, created automatically via `db.js`.

## API reference

| Method | Path                        | Description                          |
|--------|-----------------------------|---------------------------------------|
| GET    | /api/products               | List products (`?category=`, `?q=`)  |
| GET    | /api/products/categories    | Distinct category list                |
| GET    | /api/products/:id           | Single product                       |
| POST   | /api/auth/register          | Create account, logs in               |
| POST   | /api/auth/login             | Sign in                               |
| POST   | /api/auth/logout            | Sign out                              |
| GET    | /api/auth/me                | Current session user (or null)        |
| GET    | /api/cart                   | Current cart (guest or user)          |
| POST   | /api/cart/items             | Add item `{product_id, quantity}`     |
| PUT    | /api/cart/items/:id         | Update quantity (0 removes it)        |
| DELETE | /api/cart/items/:id         | Remove item                          |
| POST   | /api/orders                 | Place order (requires sign-in)        |
| GET    | /api/orders                 | Order history (requires sign-in)      |
| GET    | /api/orders/:id              | Single order (requires sign-in)       |

## Notes on going to production

- Set a real `JWT_SECRET` environment variable (a random one is generated per process
  start otherwise, which is fine for local dev but means restarting the server logs
  everyone out).
- Swap the placeholder "record sleeve" art (CSS gradients + drawn vinyl disc) for real
  product photography whenever you have it — the `color_a`/`color_b` fields on each
  product just feed the gradient today.
- Add HTTPS + `secure: true` on cookies before deploying anywhere public.
