import { useState, useEffect, useCallback, useMemo } from "react";
import api from "../api/axios";
import ProductCard from "../components/ProductCard";

const TILE_ACCENTS = ["accent-brass", "accent-sage", "accent-rust", "accent-teal", "accent-plum", "accent-ochre"];

const Home = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ keyword: "", category: "", sort: "" });
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = { ...filters, page };
      Object.keys(params).forEach((k) => !params[k] && delete params[k]);
      const { data } = await api.get("/products", { params });
      setProducts(data.products);
      setPages(data.pages);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [filters, page]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  useEffect(() => {
    api.get("/products/categories").then(({ data }) => setCategories(data.categories));
  }, []);

  const handleFilterChange = (e) => {
    setPage(1);
    setFilters((f) => ({ ...f, [e.target.name]: e.target.value }));
  };

  const jumpToCategory = (cat) => {
    setPage(1);
    setFilters((f) => ({ ...f, category: cat }));
    document.getElementById("catalog")?.scrollIntoView({ behavior: "smooth" });
  };

  const clearAndScroll = () => {
    setPage(1);
    setFilters({ keyword: "", category: "", sort: "" });
    document.getElementById("catalog")?.scrollIntoView({ behavior: "smooth" });
  };

  const deals = useMemo(
    () => products.filter((p) => p.discountPrice > 0 && p.discountPrice < p.price).slice(0, 8),
    [products]
  );

  const topRated = useMemo(
    () => [...products].filter((p) => p.numReviews > 0).sort((a, b) => b.rating - a.rating).slice(0, 8),
    [products]
  );

  return (
    <div>
      {/* ---------- Promo banner ---------- */}
      <section className="promo-banner">
        <div className="promo-banner-inner">
          <div className="promo-copy">
            <p className="hero-eyebrow">CodeAlpha Full Stack Internship — Task 01</p>
            <h1>Everyday goods, priced like it's still 1985 &mdash; honestly.</h1>
            <p>
              Electronics, footwear, home essentials &amp; more. Every price tag shown exactly as
              it's stocked, no hidden fees, no dark patterns.
            </p>
            <div className="hero-actions">
              <button className="btn btn-primary" onClick={clearAndScroll}>
                Browse Catalog
              </button>
              {deals.length > 0 && (
                <a href="#deals" className="btn btn-outline-light">
                  Today's Deals
                </a>
              )}
            </div>
          </div>

          <div className="hero-ticket-wrap">
            <div className="hero-ticket">
              <span className="ticket-hole"></span>
              <p className="ticket-eyebrow">No markup, no markdown games</p>
              <h3 className="ticket-name">Transistor Radio</h3>
              <p className="ticket-sku">SKU · 1985-004</p>
              <div className="ticket-price-row">
                <span className="ticket-price">₹1,299</span>
                <span className="ticket-was">was ₹1,299</span>
              </div>
              <p className="ticket-note">same price, every single time</p>
              <div className="ticket-stamp">Honest<br />Price</div>
            </div>
          </div>
        </div>

        {/* quick-link shortcut strip, Amazon-style */}
        <div className="quick-strip">
          <div className="container quick-strip-inner">
            {["New Arrivals", "Top Rated", "Under ₹500", "Best Sellers"].map((label, i) => (
              <button
                key={label}
                className="quick-chip"
                onClick={() => {
                  if (label === "Top Rated") {
                    setFilters((f) => ({ ...f, sort: "rating" }));
                  } else if (label === "Under ₹500") {
                    setFilters((f) => ({ ...f, sort: "price_asc" }));
                  } else {
                    setFilters((f) => ({ ...f, sort: "" }));
                  }
                  setPage(1);
                  document.getElementById("catalog")?.scrollIntoView({ behavior: "smooth" });
                }}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- Shop by category tiles ---------- */}
      {categories.length > 0 && (
        <section className="section category-section">
          <div className="container">
            <div className="section-heading">
              <h2>Shop by category</h2>
            </div>
            <div className="category-grid">
              {categories.map((c, i) => (
                <button
                  key={c}
                  className={`category-tile ${TILE_ACCENTS[i % TILE_ACCENTS.length]}`}
                  onClick={() => jumpToCategory(c)}
                >
                  <span className="category-tile-mark">{c.charAt(0).toUpperCase()}</span>
                  <span className="category-tile-name">{c}</span>
                  <span className="category-tile-cta">Shop now →</span>
                </button>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ---------- Deals row ---------- */}
      {!loading && deals.length > 0 && (
        <section className="section deals-section" id="deals">
          <div className="container">
            <div className="section-heading">
              <h2>Today's deals</h2>
              <span className="deals-tag">Prices honestly cut, not inflated first</span>
            </div>
            <div className="deals-scroll">
              {deals.map((p) => (
                <div className="deals-scroll-item" key={p._id}>
                  <ProductCard product={p} />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ---------- Top rated row ---------- */}
      {!loading && topRated.length > 0 && (
        <section className="section deals-section">
          <div className="container">
            <div className="section-heading">
              <h2>Highly rated by customers</h2>
            </div>
            <div className="deals-scroll">
              {topRated.map((p) => (
                <div className="deals-scroll-item" key={p._id}>
                  <ProductCard product={p} />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ---------- Full catalog ---------- */}
      <section className="section" id="catalog">
        <div className="container">
          <div className="section-heading">
            <h2>Full catalog</h2>
          </div>

          <div className="filters-bar">
            <input
              type="text"
              name="keyword"
              placeholder="Search products..."
              value={filters.keyword}
              onChange={handleFilterChange}
            />
            <select name="category" value={filters.category} onChange={handleFilterChange}>
              <option value="">All Categories</option>
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            <select name="sort" value={filters.sort} onChange={handleFilterChange}>
              <option value="">Sort: Newest</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="rating">Top Rated</option>
            </select>
          </div>

          {loading ? (
            <div className="loading-state">Loading products…</div>
          ) : products.length === 0 ? (
            <div className="empty-state">
              <h3>No products found</h3>
              <p>Try adjusting your search or filters.</p>
            </div>
          ) : (
            <>
              <div className="product-grid">
                {products.map((p) => (
                  <ProductCard key={p._id} product={p} />
                ))}
              </div>

              {pages > 1 && (
                <div style={{ display: "flex", justifyContent: "center", gap: 10, marginTop: 32 }}>
                  {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
                    <button
                      key={p}
                      onClick={() => setPage(p)}
                      className={p === page ? "btn btn-primary" : "btn btn-secondary"}
                      style={{ padding: "8px 14px" }}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </div>
  );
};

export default Home;