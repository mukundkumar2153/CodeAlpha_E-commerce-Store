import { useState, useEffect, useCallback } from "react";
import api from "../api/axios";
import ProductCard from "../components/ProductCard";

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

  return (
    <div>
      <section className="hero">
        <div className="hero-inner">
          <p className="hero-eyebrow">CodeAlpha Full Stack Internship — Task 01</p>
          <h1>Everyday goods, priced like it's still 1985 &mdash; honestly.</h1>
          <p>
            Browse electronics, footwear, and home essentials. Every price tag shown exactly as
            it's stocked, no hidden fees, no dark patterns.
          </p>
          <div className="hero-actions">
            <a href="#catalog" className="btn btn-primary">
              Browse Catalog
            </a>
          </div>
        </div>
      </section>

      <section className="section" id="catalog">
        <div className="container">
          <div className="section-heading">
            <h2>Catalog</h2>
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
