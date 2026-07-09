async function loadCart() {
  const container = document.getElementById("cart-items");
  const { items, subtotal, count } = await api("/cart");

  document.getElementById("item-count-label").textContent = `${count} item${count === 1 ? "" : "s"}`;
  document.getElementById("sum-subtotal").textContent = money(subtotal);
  document.getElementById("sum-total").textContent = money(subtotal);

  if (items.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <h3>Your crate is empty</h3>
        <p>Go dig through the catalog and find something worth carrying home.</p>
        <div style="margin-top:20px;"><a class="btn btn-primary" href="/index.html">Browse records</a></div>
      </div>`;
    return;
  }

  container.innerHTML = items
    .map(
      (item) => `
    <div class="cart-item" data-cart-item-id="${item.cart_item_id}">
      <div class="swatch" style="background: linear-gradient(135deg, ${item.product.color_a}, ${item.product.color_b})">
        <div class="disc-peek"></div>
      </div>
      <div class="info">
        <div class="title"><a href="/product.html?id=${item.product.id}">${item.product.title}</a></div>
        <div class="artist">${item.product.artist}</div>
        <button class="remove" type="button" data-remove="${item.cart_item_id}">Remove</button>
      </div>
      <div class="qty-stepper cart-qty">
        <button type="button" data-decrement="${item.cart_item_id}" data-qty="${item.quantity}" aria-label="Decrease quantity">−</button>
        <span>${item.quantity}</span>
        <button type="button" data-increment="${item.cart_item_id}" data-qty="${item.quantity}" data-stock="${item.product.stock}" aria-label="Increase quantity">+</button>
      </div>
      <div class="cart-line-total mono">${money(item.product.price * item.quantity)}</div>
    </div>
  `
    )
    .join("");

  container.querySelectorAll("[data-remove]").forEach((btn) =>
    btn.addEventListener("click", () => updateItem(btn.dataset.remove, 0))
  );
  container.querySelectorAll("[data-increment]").forEach((btn) =>
    btn.addEventListener("click", () => {
      const stock = Number(btn.dataset.stock);
      const nextQty = Number(btn.dataset.qty) + 1;
      if (nextQty > stock) return showToast(`Only ${stock} left in stock.`);
      updateItem(btn.dataset.increment, nextQty);
    })
  );
  container.querySelectorAll("[data-decrement]").forEach((btn) =>
    btn.addEventListener("click", () => updateItem(btn.dataset.decrement, Number(btn.dataset.qty) - 1))
  );
}

async function updateItem(cartItemId, quantity) {
  try {
    if (quantity <= 0) {
      await api(`/cart/items/${cartItemId}`, { method: "DELETE" });
    } else {
      await api(`/cart/items/${cartItemId}`, { method: "PUT", body: { quantity } });
    }
    await loadCart();
    refreshHeader();
  } catch (err) {
    showToast(err.message);
  }
}

async function initCheckoutArea() {
  const { user } = await api("/auth/me");
  document.getElementById("checkout-signed-out").style.display = user ? "none" : "block";
  document.getElementById("checkout-form").style.display = user ? "block" : "none";
}

document.getElementById("checkout-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const errorBox = document.getElementById("checkout-error");
  errorBox.classList.remove("show");
  const btn = document.getElementById("place-order-btn");
  btn.disabled = true;
  btn.textContent = "Placing order…";
  try {
    const { order } = await api("/orders", {
      method: "POST",
      body: {
        shipping_name: document.getElementById("ship-name").value.trim(),
        shipping_address: document.getElementById("ship-address").value.trim(),
      },
    });
    window.location.href = `/orders.html?justPlaced=${order.id}`;
  } catch (err) {
    errorBox.textContent = err.message;
    errorBox.classList.add("show");
    btn.disabled = false;
    btn.textContent = "Place order";
  }
});

loadCart();
initCheckoutArea();
