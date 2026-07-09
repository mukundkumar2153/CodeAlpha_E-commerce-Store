const params = new URLSearchParams(window.location.search);
const productId = params.get("id");
let qty = 1;
let currentProduct = null;

function stockLine(stock) {
  if (stock <= 0) return `<div class="stock-line out">Out of stock — back next pressing</div>`;
  if (stock <= 5) return `<div class="stock-line low">Only ${stock} left</div>`;
  return `<div class="stock-line">In stock, ready to ship</div>`;
}

function renderQty() {
  const el = document.getElementById("qty-value");
  if (el) el.textContent = qty;
}

async function load() {
  const root = document.getElementById("detail-root");
  if (!productId) {
    root.innerHTML = `<div class="empty-state"><h3>No record selected</h3><p>Head back to the catalog and pick one.</p></div>`;
    return;
  }
  try {
    const { product } = await api(`/products/${productId}`);
    currentProduct = product;
    document.title = `${product.title} — Wax & Wire`;
    document.getElementById("crumb-title").textContent = product.title;

    root.innerHTML = `
      <div class="product-detail">
        <div class="detail-sleeve" style="background: linear-gradient(135deg, ${product.color_a}, ${product.color_b})">
          <div class="disc-peek"></div>
        </div>
        <div class="detail-info">
          <div class="format-line">${product.format || "Record"} · ${product.category}</div>
          <h1>${product.title}</h1>
          <div class="artist-line">${product.artist}${product.year ? " · " + product.year : ""}</div>
          <div class="price-big mono">${money(product.price)}</div>
          <p class="desc">${product.description || ""}</p>
          ${stockLine(product.stock)}
          <div class="qty-row">
            <div class="qty-stepper">
              <button type="button" id="qty-minus" aria-label="Decrease quantity">−</button>
              <span id="qty-value">1</span>
              <button type="button" id="qty-plus" aria-label="Increase quantity">+</button>
            </div>
          </div>
          <div class="detail-actions">
            <button class="btn btn-primary" id="add-to-cart" ${product.stock <= 0 ? "disabled" : ""}>Add to crate — ${money(product.price)}</button>
            <a class="btn btn-ghost" href="/cart.html">View crate</a>
          </div>
          <div class="spec-grid">
            <div><div class="label">Format</div><div class="value">${product.format || "—"}</div></div>
            <div><div class="label">Year</div><div class="value">${product.year || "—"}</div></div>
            <div><div class="label">Genre</div><div class="value">${product.category}</div></div>
          </div>
        </div>
      </div>
    `;

    document.getElementById("qty-minus").addEventListener("click", () => {
      qty = Math.max(1, qty - 1);
      renderQty();
    });
    document.getElementById("qty-plus").addEventListener("click", () => {
      qty = Math.min(product.stock, qty + 1);
      renderQty();
    });
    document.getElementById("add-to-cart").addEventListener("click", () => addToCart(product.id, qty));
  } catch (err) {
    root.innerHTML = `<div class="empty-state"><h3>Couldn't find that record</h3><p>${err.message}</p></div>`;
  }
}

load();
