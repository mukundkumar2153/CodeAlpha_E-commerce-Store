const API_BASE = "/api";

async function api(path, options = {}) {
  const res = await fetch(API_BASE + path, {
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    ...options,
    body: options.body ? JSON.stringify(options.body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || "Something went wrong. Please try again.");
  }
  return data;
}

function money(n) {
  return `$${Number(n).toFixed(2)}`;
}

function showToast(message) {
  let toast = document.querySelector(".toast");
  if (!toast) {
    toast = document.createElement("div");
    toast.className = "toast";
    document.body.appendChild(toast);
  }
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => toast.classList.remove("show"), 2400);
}

function sleeveArt(product, { withDisc = true } = {}) {
  return `
    <div class="sleeve-art" style="background: linear-gradient(135deg, ${product.color_a}, ${product.color_b})">
      <span class="format-tag">${product.format || ""}</span>
      ${withDisc ? '<div class="disc-peek"></div>' : ""}
    </div>
  `;
}

async function refreshHeader() {
  const cartCountEls = document.querySelectorAll("[data-cart-count]");
  const authAreaEls = document.querySelectorAll("[data-auth-area]");

  try {
    const [{ user }, cart] = await Promise.all([api("/auth/me"), api("/cart")]);
    cartCountEls.forEach((el) => {
      el.textContent = cart.count;
      el.style.display = cart.count > 0 ? "inline-flex" : "none";
    });
    authAreaEls.forEach((el) => {
      if (user) {
        el.innerHTML = `
          <a class="icon-link" href="/orders.html">Orders</a>
          <a class="icon-link" href="#" id="logout-link">Sign out</a>
        `;
        const logoutLink = el.querySelector("#logout-link");
        if (logoutLink) {
          logoutLink.addEventListener("click", async (e) => {
            e.preventDefault();
            await api("/auth/logout", { method: "POST" });
            showToast("Signed out.");
            setTimeout(() => (window.location.href = "/index.html"), 400);
          });
        }
      } else {
        el.innerHTML = `<a class="icon-link" href="/login.html">Sign in</a>`;
      }
    });
  } catch (err) {
    // Fail quietly on header widgets; the rest of the page should still work.
    console.error(err);
  }
}

async function addToCart(productId, quantity = 1) {
  try {
    await api("/cart/items", { method: "POST", body: { product_id: productId, quantity } });
    showToast("Added to your crate.");
    refreshHeader();
  } catch (err) {
    showToast(err.message);
  }
}

document.addEventListener("DOMContentLoaded", refreshHeader);
