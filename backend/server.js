const express = require("express");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const path = require("path");

const db = require("./db");
require("./seed"); // ensure sample catalog exists on first run
const { signToken, authMiddleware, requireAuth } = require("./auth");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(cookieParser());
app.use(authMiddleware);

// Every visitor (signed in or not) gets a stable cart identity.
app.use((req, res, next) => {
  if (req.user) {
    req.cartKey = `user:${req.user.id}`;
    return next();
  }
  let guestId = req.cookies.guest_id;
  if (!guestId) {
    guestId = crypto.randomUUID();
    res.cookie("guest_id", guestId, { httpOnly: true, sameSite: "lax", maxAge: 1000 * 60 * 60 * 24 * 30 });
  }
  req.cartKey = `guest:${guestId}`;
  next();
});

const asNum = (v) => Math.round(Number(v) * 100) / 100;

/* ---------------------------- AUTH ---------------------------- */

app.post("/api/auth/register", (req, res) => {
  const { name, email, password } = req.body || {};
  if (!name || !email || !password) {
    return res.status(400).json({ error: "Name, email, and password are all required." });
  }
  if (String(password).length < 6) {
    return res.status(400).json({ error: "Password must be at least 6 characters." });
  }
  const existing = db.prepare("SELECT id FROM users WHERE email = ?").get(email.toLowerCase().trim());
  if (existing) {
    return res.status(409).json({ error: "An account with that email already exists." });
  }
  const hash = bcrypt.hashSync(password, 10);
  const info = db
    .prepare("INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)")
    .run(name.trim(), email.toLowerCase().trim(), hash);
  const user = { id: info.lastInsertRowid, name: name.trim(), email: email.toLowerCase().trim() };

  mergeGuestCartIntoUser(req, user.id);

  const token = signToken(user);
  res.cookie("token", token, { httpOnly: true, sameSite: "lax", maxAge: 1000 * 60 * 60 * 24 * 7 });
  res.json({ user });
});

app.post("/api/auth/login", (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) return res.status(400).json({ error: "Email and password are required." });
  const row = db.prepare("SELECT * FROM users WHERE email = ?").get(email.toLowerCase().trim());
  if (!row || !bcrypt.compareSync(password, row.password_hash)) {
    return res.status(401).json({ error: "Those credentials don't match an account." });
  }
  mergeGuestCartIntoUser(req, row.id);

  const user = { id: row.id, name: row.name, email: row.email };
  const token = signToken(user);
  res.cookie("token", token, { httpOnly: true, sameSite: "lax", maxAge: 1000 * 60 * 60 * 24 * 7 });
  res.json({ user });
});

app.post("/api/auth/logout", (req, res) => {
  res.clearCookie("token");
  res.json({ ok: true });
});

app.get("/api/auth/me", (req, res) => {
  res.json({ user: req.user || null });
});

function mergeGuestCartIntoUser(req, userId) {
  const guestId = req.cookies.guest_id;
  if (!guestId) return;
  const guestKey = `guest:${guestId}`;
  const userKey = `user:${userId}`;
  const guestItems = db.prepare("SELECT * FROM cart_items WHERE owner_key = ?").all(guestKey);
  for (const item of guestItems) {
    const existing = db
      .prepare("SELECT * FROM cart_items WHERE owner_key = ? AND product_id = ?")
      .get(userKey, item.product_id);
    if (existing) {
      db.prepare("UPDATE cart_items SET quantity = ? WHERE id = ?").run(
        existing.quantity + item.quantity,
        existing.id
      );
    } else {
      db.prepare("INSERT INTO cart_items (owner_key, product_id, quantity) VALUES (?, ?, ?)").run(
        userKey,
        item.product_id,
        item.quantity
      );
    }
  }
  db.prepare("DELETE FROM cart_items WHERE owner_key = ?").run(guestKey);
}

/* -------------------------- PRODUCTS --------------------------- */

app.get("/api/products", (req, res) => {
  const { category, q } = req.query;
  let sql = "SELECT * FROM products WHERE 1=1";
  const params = [];
  if (category && category !== "All") {
    sql += " AND category = ?";
    params.push(category);
  }
  if (q) {
    sql += " AND (title LIKE ? OR artist LIKE ?)";
    params.push(`%${q}%`, `%${q}%`);
  }
  sql += " ORDER BY featured DESC, id ASC";
  const products = db.prepare(sql).all(...params);
  res.json({ products });
});

app.get("/api/products/categories", (req, res) => {
  const rows = db.prepare("SELECT DISTINCT category FROM products ORDER BY category").all();
  res.json({ categories: rows.map((r) => r.category) });
});

app.get("/api/products/:id", (req, res) => {
  const product = db.prepare("SELECT * FROM products WHERE id = ?").get(req.params.id);
  if (!product) return res.status(404).json({ error: "That record isn't in the crate." });
  res.json({ product });
});

/* ----------------------------- CART ----------------------------- */

function getCartWithProducts(cartKey) {
  const rows = db
    .prepare(
      `SELECT ci.id AS cart_item_id, ci.quantity, p.*
       FROM cart_items ci JOIN products p ON p.id = ci.product_id
       WHERE ci.owner_key = ? ORDER BY ci.id ASC`
    )
    .all(cartKey);
  const items = rows.map((r) => ({
    cart_item_id: r.cart_item_id,
    quantity: r.quantity,
    product: {
      id: r.id,
      title: r.title,
      artist: r.artist,
      category: r.category,
      price: r.price,
      stock: r.stock,
      color_a: r.color_a,
      color_b: r.color_b,
      format: r.format,
    },
  }));
  const subtotal = asNum(items.reduce((sum, i) => sum + i.product.price * i.quantity, 0));
  return { items, subtotal, count: items.reduce((n, i) => n + i.quantity, 0) };
}

app.get("/api/cart", (req, res) => {
  res.json(getCartWithProducts(req.cartKey));
});

app.post("/api/cart/items", (req, res) => {
  const { product_id, quantity = 1 } = req.body || {};
  const product = db.prepare("SELECT * FROM products WHERE id = ?").get(product_id);
  if (!product) return res.status(404).json({ error: "That record isn't in the crate." });

  const existing = db
    .prepare("SELECT * FROM cart_items WHERE owner_key = ? AND product_id = ?")
    .get(req.cartKey, product_id);

  const desiredQty = existing ? existing.quantity + Number(quantity) : Number(quantity);
  if (desiredQty > product.stock) {
    return res.status(400).json({ error: `Only ${product.stock} left in stock.` });
  }

  if (existing) {
    db.prepare("UPDATE cart_items SET quantity = ? WHERE id = ?").run(desiredQty, existing.id);
  } else {
    db.prepare("INSERT INTO cart_items (owner_key, product_id, quantity) VALUES (?, ?, ?)").run(
      req.cartKey,
      product_id,
      Number(quantity)
    );
  }
  res.json(getCartWithProducts(req.cartKey));
});

app.put("/api/cart/items/:cartItemId", (req, res) => {
  const { quantity } = req.body || {};
  const item = db
    .prepare("SELECT * FROM cart_items WHERE id = ? AND owner_key = ?")
    .get(req.params.cartItemId, req.cartKey);
  if (!item) return res.status(404).json({ error: "That item isn't in your cart." });

  if (Number(quantity) <= 0) {
    db.prepare("DELETE FROM cart_items WHERE id = ?").run(item.id);
  } else {
    const product = db.prepare("SELECT * FROM products WHERE id = ?").get(item.product_id);
    if (Number(quantity) > product.stock) {
      return res.status(400).json({ error: `Only ${product.stock} left in stock.` });
    }
    db.prepare("UPDATE cart_items SET quantity = ? WHERE id = ?").run(Number(quantity), item.id);
  }
  res.json(getCartWithProducts(req.cartKey));
});

app.delete("/api/cart/items/:cartItemId", (req, res) => {
  db.prepare("DELETE FROM cart_items WHERE id = ? AND owner_key = ?").run(
    req.params.cartItemId,
    req.cartKey
  );
  res.json(getCartWithProducts(req.cartKey));
});

/* ---------------------------- ORDERS ----------------------------- */

app.post("/api/orders", requireAuth, (req, res) => {
  const { shipping_name, shipping_address } = req.body || {};
  if (!shipping_name || !shipping_address) {
    return res.status(400).json({ error: "Shipping name and address are required." });
  }
  const cart = getCartWithProducts(req.cartKey);
  if (cart.items.length === 0) {
    return res.status(400).json({ error: "Your crate is empty." });
  }
  for (const item of cart.items) {
    if (item.quantity > item.product.stock) {
      return res.status(400).json({ error: `Only ${item.product.stock} left of "${item.product.title}".` });
    }
  }

  const placeOrder = db.transaction(() => {
    const orderInfo = db
      .prepare(
        "INSERT INTO orders (user_id, total, status, shipping_name, shipping_address) VALUES (?, ?, 'processing', ?, ?)"
      )
      .run(req.user.id, cart.subtotal, shipping_name, shipping_address);
    const orderId = orderInfo.lastInsertRowid;

    const insertItem = db.prepare(
      "INSERT INTO order_items (order_id, product_id, title, artist, price, quantity) VALUES (?, ?, ?, ?, ?, ?)"
    );
    const decrementStock = db.prepare("UPDATE products SET stock = stock - ? WHERE id = ?");

    for (const item of cart.items) {
      insertItem.run(orderId, item.product.id, item.product.title, item.product.artist, item.product.price, item.quantity);
      decrementStock.run(item.quantity, item.product.id);
    }
    db.prepare("DELETE FROM cart_items WHERE owner_key = ?").run(req.cartKey);
    return orderId;
  });

  const orderId = placeOrder();
  const order = db.prepare("SELECT * FROM orders WHERE id = ?").get(orderId);
  const items = db.prepare("SELECT * FROM order_items WHERE order_id = ?").all(orderId);
  res.status(201).json({ order: { ...order, items } });
});

app.get("/api/orders", requireAuth, (req, res) => {
  const orders = db
    .prepare("SELECT * FROM orders WHERE user_id = ? ORDER BY id DESC")
    .all(req.user.id);
  const withItems = orders.map((o) => ({
    ...o,
    items: db.prepare("SELECT * FROM order_items WHERE order_id = ?").all(o.id),
  }));
  res.json({ orders: withItems });
});

app.get("/api/orders/:id", requireAuth, (req, res) => {
  const order = db
    .prepare("SELECT * FROM orders WHERE id = ? AND user_id = ?")
    .get(req.params.id, req.user.id);
  if (!order) return res.status(404).json({ error: "Order not found." });
  const items = db.prepare("SELECT * FROM order_items WHERE order_id = ?").all(order.id);
  res.json({ order: { ...order, items } });
});

/* --------------------------- STATIC UI --------------------------- */

app.use(express.static(path.join(__dirname, "..", "public")));

app.listen(PORT, () => {
  console.log(`Wax & Wire server running at http://localhost:${PORT}`);
});
