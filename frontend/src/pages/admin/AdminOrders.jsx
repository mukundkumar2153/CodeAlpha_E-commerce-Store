import { useState, useEffect } from "react";
import api from "../../api/axios";
import toast from "react-hot-toast";

const statuses = ["pending", "processing", "shipped", "delivered", "cancelled"];

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/orders");
      setOrders(data.orders);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const updateStatus = async (id, status) => {
    try {
      await api.put(`/orders/${id}/status`, { status });
      toast.success("Order status updated");
      fetchOrders();
    } catch (error) {
      toast.error("Could not update status");
    }
  };

  if (loading) return <div className="loading-state">Loading orders…</div>;

  return (
    <div>
      <h1 style={{ marginBottom: 24 }}>All Orders</h1>
      <table className="data-table">
        <thead>
          <tr>
            <th>Order ID</th>
            <th>Customer</th>
            <th>Total</th>
            <th>Payment</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((o) => (
            <tr key={o._id}>
              <td>{o._id.slice(-8).toUpperCase()}</td>
              <td>{o.user?.name || "Unknown"}</td>
              <td>₹{o.totalPrice.toLocaleString()}</td>
              <td>{o.isPaid ? "Paid" : "Unpaid"} ({o.paymentMethod})</td>
              <td>
                <select value={o.status} onChange={(e) => updateStatus(o._id, e.target.value)}>
                  {statuses.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AdminOrders;
