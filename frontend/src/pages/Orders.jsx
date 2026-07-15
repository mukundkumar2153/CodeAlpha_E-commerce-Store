import { useState, useEffect } from "react";
import api from "../api/axios";

const statusClass = {
  pending: "status-pending",
  processing: "status-processing",
  shipped: "status-shipped",
  delivered: "status-delivered",
  cancelled: "status-cancelled",
};

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/orders/my")
      .then(({ data }) => setOrders(data.orders))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading-state">Loading orders…</div>;

  if (orders.length === 0) {
    return (
      <div className="orders-page">
        <div className="empty-state">
          <h3>No orders yet</h3>
          <p>Once you place an order, it'll show up here.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="orders-page">
      <h1 style={{ marginBottom: 28 }}>Your Orders</h1>
      {orders.map((order) => (
        <div className="order-card" key={order._id}>
          <div className="order-card-header">
            <span>#{order._id.slice(-8).toUpperCase()}</span>
            <span>{new Date(order.createdAt).toLocaleDateString()}</span>
            <span className={`status-pill ${statusClass[order.status]}`}>{order.status}</span>
          </div>
          {order.items.map((item, i) => (
            <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", fontSize: "0.9rem" }}>
              <span>
                {item.name} × {item.quantity}
              </span>
              <span style={{ fontFamily: "var(--font-mono)" }}>₹{(item.price * item.quantity).toLocaleString()}</span>
            </div>
          ))}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginTop: 12,
              paddingTop: 12,
              borderTop: "1px solid var(--line)",
              fontWeight: 700,
              fontFamily: "var(--font-mono)",
            }}
          >
            <span>Total</span>
            <span>₹{order.totalPrice.toLocaleString()}</span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default Orders;
