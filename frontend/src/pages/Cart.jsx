import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";

const Cart = () => {
  const { cart, updateQuantity, removeFromCart, cartTotal } = useCart();
  const navigate = useNavigate();

  if (cart.length === 0) {
    return (
      <div className="cart-page">
        <div className="empty-state">
          <h3>Your cart is empty</h3>
          <p>Add a few things you like — they'll show up here.</p>
          <Link to="/" className="btn btn-primary" style={{ marginTop: 16, display: "inline-flex" }}>
            Browse Catalog
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-page">
      <h1 style={{ marginBottom: 28 }}>Your Cart</h1>
      <div className="cart-layout">
        <div>
          {cart.map((item) => {
            const price =
              item.product.discountPrice > 0 ? item.product.discountPrice : item.product.price;
            return (
              <div className="cart-item" key={item.product._id}>
                <img src={item.product.images?.[0]} alt={item.product.name} />
                <div>
                  <strong>{item.product.name}</strong>
                  <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", margin: "4px 0 0" }}>
                    ₹{price.toLocaleString()} each
                  </p>
                </div>
                <div className="qty-control">
                  <button onClick={() => updateQuantity(item.product._id, item.quantity - 1)}>-</button>
                  <span>{item.quantity}</span>
                  <button onClick={() => updateQuantity(item.product._id, item.quantity + 1)}>+</button>
                </div>
                <div style={{ textAlign: "right" }}>
                  <p style={{ fontFamily: "var(--font-mono)", fontWeight: 700 }}>
                    ₹{(price * item.quantity).toLocaleString()}
                  </p>
                  <button
                    onClick={() => removeFromCart(item.product._id)}
                    style={{ background: "none", border: "none", color: "var(--danger)", fontSize: "0.8rem", padding: 0 }}
                  >
                    Remove
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        <div className="cart-summary">
          <h3 style={{ marginBottom: 16 }}>Order Summary</h3>
          <div className="summary-row">
            <span>Subtotal</span>
            <span>₹{cartTotal.toLocaleString()}</span>
          </div>
          <div className="summary-row">
            <span>Shipping</span>
            <span>{cartTotal > 999 ? "Free" : "₹49"}</span>
          </div>
          <div className="summary-row total">
            <span>Total</span>
            <span>₹{(cartTotal + (cartTotal > 999 ? 0 : 49)).toLocaleString()}</span>
          </div>
          <button className="btn btn-primary btn-block" style={{ marginTop: 16 }} onClick={() => navigate("/checkout")}>
            Proceed to Checkout
          </button>
        </div>
      </div>
    </div>
  );
};

export default Cart;
