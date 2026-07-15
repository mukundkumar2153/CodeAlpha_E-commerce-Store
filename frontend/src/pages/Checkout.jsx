import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";

const loadRazorpayScript = () =>
  new Promise((resolve) => {
    if (window.Razorpay) return resolve(true);
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });

const Checkout = () => {
  const { cart, cartTotal, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [address, setAddress] = useState({
    line1: "",
    line2: "",
    city: "",
    state: "",
    postalCode: "",
    country: "India",
  });
  const [paymentMethod, setPaymentMethod] = useState("razorpay");
  const [placing, setPlacing] = useState(false);

  const shipping = cartTotal > 999 ? 0 : 49;
  const tax = Math.round(cartTotal * 0.05);
  const totalPrice = cartTotal + shipping + tax;

  const buildOrderItems = () =>
    cart.map((item) => ({
      product: item.product._id,
      name: item.product.name,
      image: item.product.images?.[0],
      price: item.product.discountPrice > 0 ? item.product.discountPrice : item.product.price,
      quantity: item.quantity,
    }));

  const placeOrder = async (paymentResult) => {
    try {
      const { data } = await api.post("/orders", {
        items: buildOrderItems(),
        shippingAddress: address,
        paymentMethod,
        paymentResult,
        itemsPrice: cartTotal,
        shippingPrice: shipping,
        taxPrice: tax,
        totalPrice,
      });
      await clearCart();
      toast.success("Order placed successfully!");
      navigate(`/orders`);
    } catch (error) {
      toast.error(error.response?.data?.message || "Could not place order");
    } finally {
      setPlacing(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    for (const key of ["line1", "city", "state", "postalCode"]) {
      if (!address[key]) {
        toast.error("Please fill in all required address fields");
        return;
      }
    }

    setPlacing(true);

    if (paymentMethod === "cod") {
      await placeOrder(undefined);
      return;
    }

    // Razorpay flow
    const scriptLoaded = await loadRazorpayScript();
    if (!scriptLoaded) {
      toast.error("Could not load payment gateway. Check your connection.");
      setPlacing(false);
      return;
    }

    try {
      const { data } = await api.post("/orders/razorpay/create", { amount: totalPrice });

      const options = {
        key: data.key,
        amount: data.razorpayOrder.amount,
        currency: data.razorpayOrder.currency,
        name: "CodeAlpha Shop",
        description: "Order Payment",
        order_id: data.razorpayOrder.id,
        prefill: { name: user?.name, email: user?.email },
        theme: { color: "#1b2430" },
        handler: async (response) => {
          await placeOrder({
            razorpayOrderId: response.razorpay_order_id,
            razorpayPaymentId: response.razorpay_payment_id,
            razorpaySignature: response.razorpay_signature,
          });
        },
        modal: {
          ondismiss: () => setPlacing(false),
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error) {
      toast.error(error.response?.data?.message || "Could not initiate payment");
      setPlacing(false);
    }
  };

  if (cart.length === 0) {
    return (
      <div className="checkout-page">
        <div className="empty-state">
          <h3>Nothing to check out</h3>
          <p>Your cart is empty.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="checkout-page">
      <h1 style={{ marginBottom: 28 }}>Checkout</h1>
      <div className="cart-layout">
        <form onSubmit={handleSubmit}>
          <h3 style={{ marginBottom: 16 }}>Shipping Address</h3>
          <div className="form-group">
            <label>Address Line 1 *</label>
            <input
              value={address.line1}
              onChange={(e) => setAddress((a) => ({ ...a, line1: e.target.value }))}
              required
            />
          </div>
          <div className="form-group">
            <label>Address Line 2</label>
            <input
              value={address.line2}
              onChange={(e) => setAddress((a) => ({ ...a, line2: e.target.value }))}
            />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <div className="form-group">
              <label>City *</label>
              <input
                value={address.city}
                onChange={(e) => setAddress((a) => ({ ...a, city: e.target.value }))}
                required
              />
            </div>
            <div className="form-group">
              <label>State *</label>
              <input
                value={address.state}
                onChange={(e) => setAddress((a) => ({ ...a, state: e.target.value }))}
                required
              />
            </div>
          </div>
          <div className="form-group">
            <label>Postal Code *</label>
            <input
              value={address.postalCode}
              onChange={(e) => setAddress((a) => ({ ...a, postalCode: e.target.value }))}
              required
            />
          </div>

          <h3 style={{ margin: "24px 0 16px" }}>Payment Method</h3>
          <div className="form-group" style={{ display: "flex", gap: 20 }}>
            <label style={{ display: "flex", alignItems: "center", gap: 8, fontWeight: 400 }}>
              <input
                type="radio"
                name="pm"
                checked={paymentMethod === "razorpay"}
                onChange={() => setPaymentMethod("razorpay")}
                style={{ width: "auto" }}
              />
              Pay Online (Razorpay)
            </label>
            <label style={{ display: "flex", alignItems: "center", gap: 8, fontWeight: 400 }}>
              <input
                type="radio"
                name="pm"
                checked={paymentMethod === "cod"}
                onChange={() => setPaymentMethod("cod")}
                style={{ width: "auto" }}
              />
              Cash on Delivery
            </label>
          </div>

          <button className="btn btn-primary btn-block" type="submit" disabled={placing} style={{ marginTop: 20 }}>
            {placing ? "Processing…" : paymentMethod === "cod" ? "Place Order" : `Pay ₹${totalPrice.toLocaleString()}`}
          </button>
        </form>

        <div className="cart-summary">
          <h3 style={{ marginBottom: 16 }}>Order Summary</h3>
          {cart.map((item) => (
            <div className="summary-row" key={item.product._id}>
              <span>
                {item.product.name} × {item.quantity}
              </span>
              <span>
                ₹{((item.product.discountPrice > 0 ? item.product.discountPrice : item.product.price) * item.quantity).toLocaleString()}
              </span>
            </div>
          ))}
          <div className="summary-row">
            <span>Shipping</span>
            <span>{shipping === 0 ? "Free" : `₹${shipping}`}</span>
          </div>
          <div className="summary-row">
            <span>Tax (5%)</span>
            <span>₹{tax.toLocaleString()}</span>
          </div>
          <div className="summary-row total">
            <span>Total</span>
            <span>₹{totalPrice.toLocaleString()}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
