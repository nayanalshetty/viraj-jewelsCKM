import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase.js";
import { useAuth } from "../context/AuthContext.jsx";
import "./AdminDashboard.css";

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const [stats, setStats] = useState({ products: 0, categories: 0, orders: 0 });
  const [role, setRole] = useState("manager");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    async function load() {
      try {
        const [products, categories, orders, roleResult] = await Promise.all([
          supabase.from("products").select("id", { count: "exact", head: true }),
          supabase.from("categories").select("id", { count: "exact", head: true }),
          supabase.from("orders").select("id", { count: "exact", head: true }),
          supabase.from("admin_roles").select("role").eq("user_id", user?.id).maybeSingle(),
        ]);
        if (active) {
          setStats({
            products: products.count || 0,
            categories: categories.count || 0,
            orders: orders.count || 0,
          });
          setRole(roleResult.data?.role || "manager");
        }
      } finally {
        if (active) setLoading(false);
      }
    }
    if (user?.id) load();
    return () => { active = false; };
  }, [user?.id]);

  const cards = [
    { to: "/admin/products", icon: "💎", title: "Products", text: "Add jewellery, weight, purity, stock and photos.", value: stats.products },
    { to: "/admin/categories", icon: "📂", title: "Categories", text: "Create new jewellery categories whenever needed.", value: stats.categories },
    { to: "/admin/orders", icon: "📦", title: "Orders", text: "View customer orders and update order status.", value: stats.orders },
    ...(role === "owner" ? [{ to: "/admin/rates", icon: "💰", title: "Gold & Silver Rates", text: "Owner-only daily metal rate management.", value: "OWNER" }] : []),
  ];

  return (
    <main className="admin-dashboard">
      <header className="admin-dashboard-header">
        <div>
          <p className="admin-eyebrow">VIRAJ JEWELLERY · ADMIN</p>
          <h1>Management Dashboard</h1>
          <p>Manage your catalogue without editing Supabase tables manually.</p>
        </div>
        <div className="admin-dashboard-actions">
          <span className="admin-role-pill">{role.toUpperCase()}</span>
          <Link to="/" className="admin-light-button">Website</Link>
          <button className="admin-dark-button" onClick={() => logout()}>Logout</button>
        </div>
      </header>

      <section className="admin-welcome">
        <div>
          <span>Signed in as</span>
          <strong>{user?.email || "Admin"}</strong>
        </div>
        <div>
          <span>Catalogue workflow</span>
          <strong>Category → Product → Images → Publish</strong>
        </div>
      </section>

      {loading ? <div className="admin-loading-box">Loading dashboard…</div> : (
        <section className="admin-card-grid">
          {cards.map((card) => (
            <Link className="admin-module-card" to={card.to} key={card.to}>
              <div className="admin-module-icon">{card.icon}</div>
              <div className="admin-module-body">
                <div className="admin-module-top">
                  <h2>{card.title}</h2>
                  <strong>{card.value}</strong>
                </div>
                <p>{card.text}</p>
                <span>Open management →</span>
              </div>
            </Link>
          ))}
        </section>
      )}

      {role !== "owner" && (
        <section className="admin-owner-note">
          <strong>Gold & Silver Rates</strong>
          <p>Daily metal rates are reserved for the owner. Assign the <code>owner</code> role in Supabase when the owner's login is ready.</p>
        </section>
      )}
    </main>
  );
}
