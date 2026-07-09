let activeCategory = "All";
let activeQuery = "";

function renderProducts(products) {
  const grid = document.getElementById("product-grid");
  const resultCount = document.getElementById("result-count");
  resultCount.textContent = `${products.length} record${products.length === 1 ? "" : "s"}`;

  if (products.length === 0) {
    grid.innerHTML = `
      <div class="empty-state" style="grid-column: 1 / -1;">
        <h3>Nothing on the shelf for that</h3>
        <p>Try a different search term or category.</p>
      </div>`;
    return;
  }

  grid.innerHTML = products
    .map(
      (p) => `
    <a class="sleeve-card" href="/product.html?id=${p.id}">
      ${sleeveArt(p)}
      <div class="sleeve-meta">
        <div class="title">${p.title}</div>
        <div class="artist">${p.artist}</div>
        <div class="price-row">
          <span class="price mono">${money(p.price)}</span>
          <button class="add-btn" type="button" data-add="${p.id}">+ Crate</button>
        </div>
      </div>
    </a>
  `
    )
    .join("");

  grid.querySelectorAll("[data-add]").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      addToCart(Number(btn.dataset.add), 1);
    });
  });
}

async function loadCategories() {
  const { categories } = await api("/products/categories");
  const row = document.getElementById("filter-row");
  categories.forEach((cat) => {
    const chip = document.createElement("button");
    chip.className = "chip";
    chip.dataset.category = cat;
    chip.textContent = cat;
    row.appendChild(chip);
  });
  row.addEventListener("click", (e) => {
    const chip = e.target.closest(".chip");
    if (!chip) return;
    row.querySelectorAll(".chip").forEach((c) => c.classList.remove("active"));
    chip.classList.add("active");
    activeCategory = chip.dataset.category;
    loadProducts();
  });
}

async function loadProducts() {
  const grid = document.getElementById("product-grid");
  grid.innerHTML = `<div class="loading-row">Loading the crate…</div>`;
  const params = new URLSearchParams();
  if (activeCategory !== "All") params.set("category", activeCategory);
  if (activeQuery) params.set("q", activeQuery);
  const { products } = await api(`/products?${params.toString()}`);
  renderProducts(products);
}

document.getElementById("search-form").addEventListener("submit", (e) => {
  e.preventDefault();
  activeQuery = document.getElementById("search-input").value.trim();
  loadProducts();
});

loadCategories();
loadProducts();
