const justPlacedId = new URLSearchParams(window.location.search).get("justPlaced");

function renderConfirmBanner(order) {
  const root = document.getElementById("confirm-root");
  root.innerHTML = `
    <div class="confirm-banner">
      <div class="disc-check">✓</div>
      <h1>Order #${order.id} is in the queue</h1>
      <p>We'll wrap it in paper sleeves and get it out the door. A copy of this order lives below whenever you want to check on it.</p>
    </div>
  `;
}

function renderOrders(orders) {
  const root = document.getElementById("orders-root");
  if (orders.length === 0) {
    root.innerHTML = `
      <div class="empty-state">
        <h3>No orders yet</h3>
        <p>Once you place an order, it'll show up here.</p>
        <div style="margin-top:20px;"><a class="btn btn-primary" href="/index.html">Browse records</a></div>
      </div>`;
    return;
  }

  root.innerHTML = orders
    .map(
      (order) => `
    <div class="order-card">
      <div class="order-head">
        <span class="num">Order #${order.id}</span>
        <span class="status">${order.status}</span>
      </div>
      <div class="order-meta">Placed ${new Date(order.created_at + "Z").toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" })} · Shipping to ${order.shipping_name}</div>
      ${order.items
        .map(
          (item) => `
        <div class="order-line">
          <span class="name">${item.title} <span class="sub">— ${item.artist} × ${item.quantity}</span></span>
          <span class="mono">${money(item.price * item.quantity)}</span>
        </div>
      `
        )
        .join("")}
      <div class="order-total">Total ${money(order.total)}</div>
    </div>
  `
    )
    .join("");
}

async function load() {
  try {
    const { user } = await api("/auth/me");
    if (!user) {
      window.location.href = "/login.html?next=/orders.html";
      return;
    }
    if (justPlacedId) {
      const { order } = await api(`/orders/${justPlacedId}`);
      renderConfirmBanner(order);
    }
    const { orders } = await api("/orders");
    renderOrders(orders);
  } catch (err) {
    document.getElementById("orders-root").innerHTML = `<div class="empty-state"><h3>Couldn't load your orders</h3><p>${err.message}</p></div>`;
  }
}

load();
