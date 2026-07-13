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
  Image as ImageIcon,
  Bike,
  ClipboardList,
} from "lucide-react";
import { Link } from "react-router-dom";
import notify from "../../../shared/utils/toast";
import api from "../../../shared/services/api";
import "../admin.css";

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

  // Analytics Sparkline Render
  const renderSparkline = (color: string, path: string) => (
    <svg viewBox="0 0 100 30" width="70" height="22" className="sparkline-svg">
      <path
        d={path}
        fill="none"
        stroke={color}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );

  return (
    <div className="admin-dashboard-container premium-animate-in">
      {/* Welcome Banner */}
      <div className="welcome-banner-premium">
        <div className="welcome-text">
          <h1 className="welcome-title-premium">Console Operations Panel ✨</h1>
          <p className="welcome-desc-premium">
            Audit stores, manage voucher campaigns, and monitor platform
            metrics.
          </p>
        </div>
        <div className="navbar-desktop-only">
          <span className="premium-badge neutral">
            <span className="badge-status-dot" /> System Status: Online
          </span>
        </div>
      </div>

      {/* Analytics Grid */}
      <div className="admin-grid-columns">
        {/* Card 1: Console Health */}
        <div className="metric-card-premium">
          <div className="metric-inner-header">
            <span className="metric-badge-label">Console Health</span>
            <div
              className="metric-icon-box"
              style={{
                color: "#3b82f6",
                background: "rgba(59,130,246,0.08)",
              }}
            >
              <ShieldAlert size={18} />
            </div>
          </div>
          <div
            className="metric-value-display"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <span
              className="badge-status-dot"
              style={{ width: "10px", height: "10px" }}
            />
            {health?.database === "connected" ? "Stable" : "Offline"}
          </div>
          <div className="metric-footer-row">
            <span className="metric-footer-text">
              Port {health?.server_port || 5000}
            </span>
            {renderSparkline(
              "#10b981",
              "M0,15 L20,15 L40,10 L60,18 L80,5 L100,12",
            )}
          </div>
        </div>

        {/* Card 2: Revenue */}
        <div className="metric-card-premium">
          <div className="metric-inner-header">
            <span className="metric-badge-label">Total Revenue</span>
            <div
              className="metric-icon-box"
              style={{
                color: "#10b981",
                background: "rgba(16,185,129,0.08)",
              }}
            >
              <DollarSign size={18} />
            </div>
          </div>
          <div className="metric-value-display">
            ₹
            {analytics
              ? analytics.total_payments_captured.toLocaleString("en-IN")
              : "0"}
          </div>
          <div className="metric-footer-row">
            <span className="metric-footer-text">Gross Payments</span>
            {renderSparkline(
              "#10b981",
              "M0,20 Q15,5 30,15 T60,5 T90,12 L100,2",
            )}
          </div>
        </div>

        {/* Card 3: Orders */}
        <div className="metric-card-premium">
          <div className="metric-inner-header">
            <span className="metric-badge-label">Orders Fulfilled</span>
            <div
              className="metric-icon-box"
              style={{
                color: "#8b5cf6",
                background: "rgba(139,92,246,0.08)",
              }}
            >
              <Award size={18} />
            </div>
          </div>
          <div className="metric-value-display">
            {analytics?.total_orders || 0}
          </div>
          <div className="metric-footer-row">
            <span className="metric-footer-text">Deliveries Completed</span>
            {renderSparkline(
              "#8b5cf6",
              "M0,18 Q15,8 30,12 T60,18 T90,5 L100,8",
            )}
          </div>
        </div>

        {/* Card 4: Outlets */}
        <div className="metric-card-premium">
          <div className="metric-inner-header">
            <span className="metric-badge-label">Outlets Onboarded</span>
            <div
              className="metric-icon-box"
              style={{
                color: "#f59e0b",
                background: "rgba(245,158,11,0.08)",
              }}
            >
              <Store size={18} />
            </div>
          </div>
          <div className="metric-value-display">
            {analytics?.total_restaurants || 0}
          </div>
          <div className="metric-footer-row">
            <span className="metric-footer-text">Active Partner Stores</span>
            {renderSparkline(
              "#f59e0b",
              "M0,15 L20,10 L40,15 L60,8 L80,12 L100,5",
            )}
          </div>
        </div>

        {/* Card 5: Users */}
        <div className="metric-card-premium">
          <div className="metric-inner-header">
            <span className="metric-badge-label">Total Users</span>
            <div
              className="metric-icon-box"
              style={{
                color: "#ec4899",
                background: "rgba(236,72,153,0.08)",
              }}
            >
              <Users size={18} />
            </div>
          </div>
          <div className="metric-value-display">
            {analytics?.total_users || 0}
          </div>
          <div className="metric-footer-row">
            <span className="metric-footer-text">Registered Accounts</span>
            {renderSparkline("#ec4899", "M0,22 Q20,10 40,18 T80,5 L100,10")}
          </div>
        </div>
      </div>

      {/* Quick Navigation */}
      <h2
        className="section-heading section-heading-md"
        style={{ margin: "40px 0 20px 0", textTransform: "uppercase" }}
      >
        Quick Navigation
      </h2>
      <div className="quick-nav-grid">
        {[
          {
            label: "Restaurants",
            icon: <Store size={18} />,
            to: "/restaurants",
            color: "#f59e0b",
          },
          {
            label: "Customers",
            icon: <Users size={18} />,
            to: "/customers",
            color: "#3b82f6",
          },
          {
            label: "Riders",
            icon: <Bike size={18} />,
            to: "/drivers",
            color: "#10b981",
          },
          {
            label: "Orders Log",
            icon: <ClipboardList size={18} />,
            to: "/orders",
            color: "#8b5cf6",
          },
          {
            label: "Voucher CMS",
            icon: <Tag size={18} />,
            to: "/cms",
            color: "#ec4899",
          },
          {
            label: "Settings",
            icon: <Settings size={18} />,
            to: "/settings",
            color: "#64748b",
          },
        ].map((nav) => (
          <Link key={nav.to} to={nav.to} className="premium-nav-card-container">
            <div
              className="premium-nav-card-icon"
              style={{
                backgroundColor: `${nav.color}12`,
                color: nav.color,
              }}
            >
              {nav.icon}
            </div>
            <span className="premium-nav-card-label">{nav.label}</span>
          </Link>
        ))}
      </div>

      {/* Two Column Section */}
      <div className="admin-two-col">
        {/* Left Column: Approvals */}
        <div className="admin-panel">
          <div className="admin-panel-title">
            <ShieldAlert size={20} color="var(--cred-accent, #f43f5e)" />{" "}
            Merchant Approval Queue
          </div>
          <p
            style={{
              color: "#64748b",
              fontSize: "0.85rem",
              marginBottom: "24px",
            }}
          >
            Verify onboarded restaurant profile submissions before admitting
            them online.
          </p>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "14px",
            }}
          >
            {restaurants.map((r) => (
              <div key={r.id} className="audit-list-item">
                <div
                  style={{ display: "flex", alignItems: "center", gap: "14px" }}
                >
                  <div className="audit-item-logo">
                    {r.name ? r.name.charAt(0).toUpperCase() : "R"}
                  </div>
                  <div>
                    <strong style={{ color: "#1e293b", fontSize: "0.95rem" }}>
                      {r.name}
                    </strong>
                    <div className="audit-item-desc">{r.description}</div>
                  </div>
                </div>

                <div>
                  {r.is_verified ? (
                    <span className="premium-badge success">Verified</span>
                  ) : (
                    <button
                      onClick={() => handleVerifyRestaurant(r.id)}
                      className="neo-btn neo-btn-primary"
                      style={{ padding: "8px 16px", fontSize: "0.85rem" }}
                    >
                      Approve
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
                No active approvals pending.
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Campaigns */}
        <div style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
          {/* Form */}
          <div className="admin-panel">
            <div className="admin-panel-title">
              <Tag size={20} color="#ec4899" /> Create Promo Code
            </div>
            <p
              style={{
                color: "#64748b",
                fontSize: "0.85rem",
                marginBottom: "24px",
              }}
            >
              Configure active coupon campaigns for customer checkout discounts.
            </p>

            <form
              onSubmit={handleAddCoupon}
              style={{ display: "flex", flexDirection: "column", gap: "16px" }}
            >
              <div className="premium-form-group">
                <label>Promo Voucher Code</label>
                <input
                  type="text"
                  placeholder="e.g. BITES50"
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  required
                  className="premium-form-input"
                />
              </div>

              <div className="premium-form-group">
                <label>Discount Type</label>
                <select
                  value={discountType}
                  onChange={(e: any) => setDiscountType(e.target.value)}
                  className="premium-form-input"
                >
                  <option value="percentage">Percentage Discount (%)</option>
                  <option value="fixed">Fixed Flat Discount (₹)</option>
                </select>
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "16px",
                }}
              >
                <div className="premium-form-group">
                  <label>Value</label>
                  <input
                    type="number"
                    placeholder="e.g. 50"
                    value={discountValue}
                    onChange={(e) => setDiscountValue(e.target.value)}
                    required
                    className="premium-form-input"
                  />
                </div>
                <div className="premium-form-group">
                  <label>Min Spend (₹)</label>
                  <input
                    type="number"
                    placeholder="e.g. 299"
                    value={minOrder}
                    onChange={(e) => setMinOrder(e.target.value)}
                    className="premium-form-input"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={couponLoading}
                className="neo-btn neo-btn-primary"
                style={{ width: "100%", marginTop: "8px" }}
              >
                {couponLoading ? "Publishing..." : "Launch Coupon"}
              </button>
            </form>
          </div>

          {/* List */}
          <div className="admin-panel">
            <div
              style={{ fontSize: "1rem", fontWeight: 800, color: "#0f172a" }}
            >
              Live Coupons ({coupons.length})
            </div>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "12px",
                marginTop: "16px",
              }}
            >
              {coupons.map((c) => (
                <div
                  key={c.id}
                  className="coupon-item-card"
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "16px",
                    background: "#f8fafc",
                    borderRadius: "12px",
                    border: "1px dashed rgba(15, 23, 42, 0.12)",
                  }}
                >
                  <div>
                    <strong style={{ fontSize: "0.9rem", color: "#0f172a" }}>
                      {c.code}
                    </strong>
                    <div
                      style={{
                        fontSize: "0.75rem",
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
                    style={{
                      border: "none",
                      background: "none",
                      color: "#ef4444",
                      cursor: "pointer",
                      padding: "6px",
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
                  No promo codes currently active.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
