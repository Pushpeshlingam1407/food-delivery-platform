import React, { useEffect, useState } from "react";
import {
  DollarSign,
  ShieldAlert,
  Award,
  Tag,
  Users,
  Store,
  Trash2,
  Settings,
  FileText,
  Image as ImageIcon,
  Bike,
  ClipboardList,
} from "lucide-react";
import { Link } from "react-router-dom";
import notify from "../../../shared/utils/toast";
import api from "../../../shared/services/api";
import "../admin.css";
import { StatCard } from "../../../shared/components/StatCard";

interface Analytics {
  total_users: number;
  total_restaurants: number;
  total_orders: number;
  total_payments_captured: number;
}

interface Restaurant {
  id: string;
  name: string;
  description: string;
  is_verified: boolean;
  owner_id: string;
}

interface Coupon {
  id: string;
  code: string;
  discount_type: "percentage" | "fixed";
  discount_value: number;
  min_order_amount: number;
}

export const Dashboard: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [health, setHealth] = useState<any>(null);

  // New coupon form states
  const [code, setCode] = useState("");
  const [discountType, setDiscountType] = useState<"percentage" | "fixed">(
    "percentage",
  );
  const [discountValue, setDiscountValue] = useState("");
  const [minOrder, setMinOrder] = useState("");
  const [couponLoading, setCouponLoading] = useState(false);

  const fetchDashboardData = async () => {
    try {
      const statsRes = await api.get("/admin/analytics");
      if (statsRes.data.status === "success") {
        setAnalytics(statsRes.data.data);
      }

      const restRes = await api.get("/restaurants");
      if (restRes.data.status === "success") {
        setRestaurants(restRes.data.data || []);
      }

      const couponRes = await api.get("/admin/coupons");
      if (couponRes.data.status === "success") {
        setCoupons(couponRes.data.data || []);
      }

      try {
        const healthRes = await api.get("/health");
        setHealth(healthRes.data);
      } catch (err) {
        console.error("Health check failed:", err);
      }
    } catch (err) {
      console.error(err);
      notify.error("Couldn't load dashboard data right now.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleVerifyRestaurant = async (id: string) => {
    try {
      const response = await api.put(`/admin/restaurants/${id}/verify`);
      if (response.data.status === "success") {
        notify.success("Restaurant has been verified.");
        setRestaurants((prev) =>
          prev.map((r) => (r.id === id ? { ...r, is_verified: true } : r)),
        );
      }
    } catch (err) {
      notify.error("We couldn't verify this restaurant. Please try again.");
    }
  };

  const handleAddCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code || !discountValue) return;

    setCouponLoading(true);
    try {
      const response = await api.post("/admin/coupons", {
        code,
        discount_type: discountType,
        discount_value: parseFloat(discountValue),
        min_order_amount: parseFloat(minOrder || "0"),
        start_date: new Date().toISOString().slice(0, 10),
        end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
          .toISOString()
          .slice(0, 10),
      });

      if (response.data.status === "success") {
        notify.success("New promo code is live!");
        setCode("");
        setDiscountValue("");
        setMinOrder("");
        fetchDashboardData();
      }
    } catch (err: any) {
      notify.error(
        err.response?.data?.message || "We couldn't create the promo code.",
      );
    } finally {
      setCouponLoading(false);
    }
  };

  const handleDeleteCoupon = async (id: string) => {
    try {
      const response = await api.delete(`/admin/coupons/${id}`);
      if (response.data.status === "success") {
        notify.info("Promo code removed.");
        setCoupons((prev) => prev.filter((c) => c.id !== id));
      }
    } catch (err) {
      notify.error("We couldn't delete the promo code.");
    }
  };

  if (loading) {
    return (
      <div className="screen-center">
        <p className="text-muted">Loading system dashboard...</p>
      </div>
    );
  }

  return (
    <div style={{ width: "100%" }}>
      {/* Humanized Welcome Banner */}
      <div className="welcome-banner">
        <div className="welcome-text">
          <h1>Welcome back, Chief! ✨</h1>
          <p>
            Here is a bird's-eye view of your Bites platform. Everything looks
            good and active.
          </p>
        </div>
        <div className="navbar-desktop-only" style={{ textAlign: "right" }}>
          <span
            style={{
              fontSize: "0.85rem",
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "1px",
              color: "var(--accent-orange)",
              background: "#fff0ec",
              padding: "6px 16px",
              borderRadius: "99px",
            }}
          >
            System Administrator
          </span>
        </div>
      </div>

      {/* Analytics Grid */}
      <div className="admin-grid-columns">
        <StatCard
          theme="admin"
          title="Console Health"
          icon={<ShieldAlert size={18} />}
          value={
            <>
              <span
                className="admin-status-dot"
                style={{ width: "10px", height: "10px" }}
              />
              {health?.database === "connected" ? "Online" : "Offline"}
            </>
          }
          adminValueStyle={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
          subtitle={`Port ${health?.server_port || 5000} · DB Status: Connected`}
        />

        <StatCard
          theme="admin"
          title="Platform Revenue"
          icon={<DollarSign size={18} />}
          value={`₹${
            analytics
              ? analytics.total_payments_captured.toLocaleString("en-IN", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })
              : "0.00"
          }`}
          subtitle="Total processed order volume"
        />

        <StatCard
          theme="admin"
          title="Orders Fulfilled"
          icon={<Award size={18} />}
          value={analytics?.total_orders || 0}
          subtitle="Total successful deliveries"
        />

        <StatCard
          theme="admin"
          title="Active Outlets"
          icon={<Store size={18} />}
          value={analytics?.total_restaurants || 0}
          subtitle="Onboarded merchant stores"
        />

        <StatCard
          theme="admin"
          title="Total Users"
          icon={<Users size={18} />}
          value={analytics?.total_users || 0}
          subtitle="Customers, owners & riders"
        />
      </div>

      {/* Premium Quick Navigation Grid */}
      <h2
        style={{
          fontSize: "1.2rem",
          fontWeight: 700,
          margin: "32px 0 16px 0",
          color: "#1e293b",
          fontFamily: "var(--font-anthropic)",
        }}
      >
        Quick Navigation
      </h2>
      <div className="quick-nav-grid" style={{ marginBottom: "32px" }}>
        {[
          {
            label: "Restaurants",
            icon: <Store size={20} />,
            to: "/restaurants",
            color: "#f59e0b",
          },
          {
            label: "Customers",
            icon: <Users size={20} />,
            to: "/customers",
            color: "#3b82f6",
          },
          {
            label: "Delivery Partners",
            icon: <Bike size={20} />,
            to: "/drivers",
            color: "#10b981",
          },
          {
            label: "Orders",
            icon: <ClipboardList size={20} />,
            to: "/orders",
            color: "#8b5cf6",
          },
          {
            label: "Images",
            icon: <ImageIcon size={20} />,
            to: "/images",
            color: "#ec4899",
          },
          {
            label: "Settings",
            icon: <Settings size={20} />,
            to: "/settings",
            color: "#64748b",
          },
        ].map((nav) => (
          <Link key={nav.to} to={nav.to} className="premium-nav-card">
            <div
              className="premium-nav-icon"
              style={{ backgroundColor: `${nav.color}15`, color: nav.color }}
            >
              {nav.icon}
            </div>
            <span className="premium-nav-label">{nav.label}</span>
          </Link>
        ))}
      </div>

      <div className="admin-two-col">
        {/* Left Column - Restaurant Auditing */}
        <div className="admin-panel">
          <div className="admin-panel-title">
            <ShieldAlert size={20} color="#ff3f1a" /> Merchant Approval Queue
          </div>
          <p
            style={{
              color: "#64748b",
              fontSize: "0.9rem",
              marginBottom: "20px",
            }}
          >
            Verify and audit new restaurant partner stores before allowing them
            to accept orders.
          </p>

          <div
            style={{ display: "flex", flexDirection: "column", gap: "14px" }}
          >
            {restaurants.map((r) => (
              <div key={r.id} className="audit-list-item">
                <div
                  style={{ display: "flex", alignItems: "center", gap: "14px" }}
                >
                  <div className="audit-avatar">
                    {r.name ? r.name.charAt(0).toUpperCase() : "R"}
                  </div>
                  <div>
                    <strong style={{ color: "#1e293b", fontSize: "0.95rem" }}>
                      {r.name}
                    </strong>
                    <div
                      style={{
                        color: "#64748b",
                        fontSize: "0.85rem",
                        marginTop: "2px",
                      }}
                    >
                      {r.description}
                    </div>
                  </div>
                </div>

                <div>
                  {r.is_verified ? (
                    <span
                      style={{
                        background: "#ecfdf5",
                        color: "#10b981",
                        fontSize: "0.75rem",
                        fontWeight: 700,
                        padding: "6px 12px",
                        borderRadius: "99px",
                      }}
                    >
                      VERIFIED
                    </span>
                  ) : (
                    <button
                      onClick={() => handleVerifyRestaurant(r.id)}
                      className="btn-premium btn-sm"
                      style={{
                        padding: "8px 16px",
                        fontSize: "0.8rem",
                        cursor: "pointer",
                      }}
                    >
                      Verify Store
                    </button>
                  )}
                </div>
              </div>
            ))}

            {restaurants.length === 0 && (
              <div
                style={{
                  textAlign: "center",
                  padding: "40px 20px",
                  color: "#94a3b8",
                  fontSize: "0.9rem",
                }}
              >
                No partner stores found in the database.
              </div>
            )}
          </div>
        </div>

        {/* Right Column - Coupon Manager */}
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          {/* Create Coupon Widget */}
          <div className="admin-panel">
            <div className="admin-panel-title">
              <Tag size={20} color="#7a00ff" /> Launch Campaign Coupon
            </div>
            <p
              style={{
                color: "#64748b",
                fontSize: "0.9rem",
                marginBottom: "20px",
              }}
            >
              Publish new promotional voucher codes for your customers.
            </p>

            <form
              onSubmit={handleAddCoupon}
              style={{ display: "flex", flexDirection: "column", gap: "14px" }}
            >
              <input
                type="text"
                placeholder="PROMO CODE (e.g. BITES50)"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                required
                className="input-premium"
                style={{ width: "100%" }}
              />

              <select
                value={discountType}
                onChange={(e: any) => setDiscountType(e.target.value)}
                className="input-premium"
                style={{ width: "100%" }}
              >
                <option value="percentage">Percentage Discount (%)</option>
                <option value="fixed">Fixed Cash Discount (₹)</option>
              </select>

              <input
                type="number"
                placeholder="Discount Value"
                value={discountValue}
                onChange={(e) => setDiscountValue(e.target.value)}
                required
                className="input-premium"
                style={{ width: "100%" }}
              />

              <input
                type="number"
                placeholder="Min Basket Value (₹)"
                value={minOrder}
                onChange={(e) => setMinOrder(e.target.value)}
                className="input-premium"
                style={{ width: "100%" }}
              />

              <button
                type="submit"
                disabled={couponLoading}
                className="btn-premium"
                style={{
                  width: "100%",
                  padding: "12px",
                  fontSize: "0.9rem",
                  cursor: "pointer",
                  marginTop: "6px",
                }}
              >
                {couponLoading ? "Publishing..." : "Launch Coupon"}
              </button>
            </form>
          </div>

          {/* Active Campaign Coupons */}
          <div className="admin-panel">
            <div className="admin-panel-title" style={{ fontSize: "1rem" }}>
              Live Platform Coupons
            </div>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "12px",
                marginTop: "14px",
              }}
            >
              {coupons.map((c) => (
                <div key={c.id} className="coupon-item-card">
                  <div>
                    <strong style={{ fontSize: "0.9rem", color: "#1e293b" }}>
                      {c.code}
                    </strong>
                    <div
                      style={{
                        fontSize: "0.78rem",
                        color: "#64748b",
                        marginTop: "3px",
                      }}
                    >
                      Get {c.discount_value}
                      {c.discount_type === "percentage" ? "%" : "₹"} off · Min
                      spend ₹{c.min_order_amount}
                    </div>
                  </div>
                  <button
                    onClick={() => handleDeleteCoupon(c.id)}
                    className="icon-button-danger"
                    style={{
                      border: "none",
                      background: "none",
                      color: "#ef4444",
                      cursor: "pointer",
                      padding: "6px",
                      borderRadius: "6px",
                    }}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}

              {coupons.length === 0 && (
                <div
                  style={{
                    textAlign: "center",
                    padding: "20px 10px",
                    color: "#94a3b8",
                    fontSize: "0.85rem",
                  }}
                >
                  No active coupon campaigns running.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
