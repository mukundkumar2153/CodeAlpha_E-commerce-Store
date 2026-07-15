import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import api from "../api/axios";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";

const ProductDetail = () => {
  const { slug } = useParams();
  const { addToCart } = useCart();
  const { user } = useAuth();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: "" });

  const fetchProduct = async () => {
    setLoading(true);
    try {
      const { data } = await api.get(`/products/${slug}`);
      setProduct(data.product);
    } catch (error) {
      toast.error("Product not found");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProduct();
    setQuantity(1);
  }, [slug]);

  const submitReview = async (e) => {
    e.preventDefault();
    try {
      await api.post(`/products/${product._id}/reviews`, reviewForm);
      toast.success("Review submitted");
      setReviewForm({ rating: 5, comment: "" });
      fetchProduct();
    } catch (error) {
      toast.error(error.response?.data?.message || "Could not submit review");
    }
  };

  if (loading) return <div className="loading-state">Loading product…</div>;
  if (!product) return <div className="empty-state"><h3>Product not found</h3></div>;

  const hasDiscount = product.discountPrice > 0 && product.discountPrice < product.price;

  return (
    <div className="product-detail-page">
      <div className="pd-layout">
        <img
          src={product.images?.[0] || "https://via.placeholder.com/600"}
          alt={product.name}
          className="pd-image"
        />

        <div>
          <span className="pd-category">{product.category} · {product.brand}</span>
          <h1 className="pd-title">{product.name}</h1>

          <div className="pd-price">
            <span>₹{(hasDiscount ? product.discountPrice : product.price).toLocaleString()}</span>
            {hasDiscount && <span className="original">₹{product.price.toLocaleString()}</span>}
          </div>

          <p className={`pd-stock ${product.stock > 0 ? "in" : "out"}`}>
            {product.stock > 0 ? `In stock (${product.stock} available)` : "Out of stock"}
          </p>

          <p className="pd-desc">{product.description}</p>

          {product.stock > 0 && (
            <div className="pd-actions">
              <div className="qty-control">
                <button onClick={() => setQuantity((q) => Math.max(1, q - 1))}>-</button>
                <span>{quantity}</span>
                <button onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}>+</button>
              </div>
              <button className="btn btn-primary" onClick={() => addToCart(product._id, quantity)}>
                Add to Cart
              </button>
            </div>
          )}
        </div>
      </div>

      <div style={{ marginTop: 60, maxWidth: 700 }}>
        <h2 style={{ marginBottom: 20 }}>
          Reviews {product.numReviews > 0 && `(${product.rating.toFixed(1)} ★ · ${product.numReviews})`}
        </h2>

        {product.reviews.length === 0 && <p style={{ color: "var(--text-muted)" }}>No reviews yet.</p>}

        {product.reviews.map((r, i) => (
          <div key={i} style={{ padding: "14px 0", borderBottom: "1px solid var(--line)" }}>
            <strong>{r.name}</strong>{" "}
            <span style={{ fontFamily: "var(--font-mono)", color: "var(--gold)" }}>
              {"★".repeat(r.rating)}
              {"☆".repeat(5 - r.rating)}
            </span>
            <p style={{ margin: "6px 0 0", color: "var(--text-muted)" }}>{r.comment}</p>
          </div>
        ))}

        {user && (
          <form onSubmit={submitReview} style={{ marginTop: 24 }}>
            <div className="form-group">
              <label>Your Rating</label>
              <select
                value={reviewForm.rating}
                onChange={(e) => setReviewForm((f) => ({ ...f, rating: Number(e.target.value) }))}
              >
                {[5, 4, 3, 2, 1].map((n) => (
                  <option key={n} value={n}>
                    {n} Star{n > 1 && "s"}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Your Review</label>
              <textarea
                rows={3}
                required
                value={reviewForm.comment}
                onChange={(e) => setReviewForm((f) => ({ ...f, comment: e.target.value }))}
              />
            </div>
            <button className="btn btn-primary" type="submit">
              Submit Review
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default ProductDetail;
