import { useState, useEffect } from "react";
import api from "../../api/axios";

const AdminDashboard = () => {
  const [stats, setStats] = useState({ orders: 0, revenue: 0, products: 0, pending: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const [ordersRes, productsRes] = await Promise.all([
          api.get("/orders"),
          api.get("/products", { params: { limit: 1000 } }),
        ]);
        const orders = ordersRes.data.orders;
        const revenue = orders.reduce((sum, o) => sum + (o.isPaid ? o.totalPrice : 0), 0);
        const pending = orders.filter((o) => o.status === "pending" || o.status === "processing").length;

        setStats({
          orders: orders.length,
          revenue,
          products: productsRes.data.total,
          pending,
        });
      } finally {
        setLoading(false);
      }
    };
    loadStats();
  }, []);

  if (loading) return <div className="loading-state">Loading dashboard…</div>;

  const cards = [
    { label: "Total Orders", value: stats.orders },
    { label: "Revenue Collected", value: `₹${stats.revenue.toLocaleString()}` },
    { label: "Products Listed", value: stats.products },
    { label: "Pending / Processing", value: stats.pending },
  ];

  return (
    <div>
      <h1 style={{ marginBottom: 24 }}>Dashboard</h1>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 18 }}>
        {cards.map((c) => (
          <div
            key={c.label}
            style={{
              background: "var(--paper-raised)",
              border: "1px solid var(--line)",
              borderRadius: 6,
              padding: 22,
            }}
          >
            <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.75rem", color: "var(--text-muted)", textTransform: "uppercase" }}>
              {c.label}
            </p>
            <p style={{ fontFamily: "var(--font-display)", fontSize: "2rem", fontWeight: 700, marginTop: 8 }}>
              {c.value}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminDashboard;
