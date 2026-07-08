import React, { useEffect, useState } from "react";
import {
  DollarSign,
  ShieldAlert,
  Award,
  Tag,
  Users,
  Store,
  Plus,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import api from "../../../shared/services/api";

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
      toast.error("Failed to load analytics data.");
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
        toast.success("Restaurant verified successfully!");
        setRestaurants((prev) =>
          prev.map((r) => (r.id === id ? { ...r, is_verified: true } : r)),
        );
      }
    } catch (err) {
      toast.error("Failed to verify restaurant.");
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
        toast.success("Promo coupon created successfully!");
        setCode("");
        setDiscountValue("");
        setMinOrder("");
        fetchDashboardData();
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to create coupon.");
    } finally {
      setCouponLoading(false);
    }
  };

  const handleDeleteCoupon = async (id: string) => {
    try {
      const response = await api.delete(`/admin/coupons/${id}`);
      if (response.data.status === "success") {
        toast.success("Coupon code deleted.");
        setCoupons((prev) => prev.filter((c) => c.id !== id));
      }
    } catch (err) {
      toast.error("Failed to delete coupon.");
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
    <div className="app-shell">
      {/* Page Title */}
      <div className="section-spacing">
        <h1 className="section-heading section-heading-lg">
          Administrator Console
        </h1>
        <p className="text-muted">
          Overview of platform analytics, restaurant audits, and system
          configuration.
        </p>
      </div>

      {/* Analytics Grid */}
      <div className="dashboard-grid section-spacing">
        <div className="panel-card">
          <div className="card-banner">SYSTEM PORTS & DB STATUS</div>
          <div className="card-stack">
            <div className="panel-row">
              <span>🔌 Backend Port:</span>
              <strong className="text-success">
                {health?.server_port || 5000} (ONLINE)
              </strong>
            </div>
            <div className="panel-row">
              <span>🗄️ MySQL Port:</span>
              <strong
                className={
                  health?.database === "connected"
                    ? "text-success"
                    : "text-danger"
                }
              >
                {health?.database_port || 3306} (
                {health?.database?.toUpperCase() || "CONNECTED"})
              </strong>
            </div>
          </div>
        </div>

        <div className="panel-card">
          <div className="card-banner">CAPTURED REVENUE</div>
          <div className="stat-value text-success">
            <DollarSign size={24} />
            {analytics?.total_payments_captured.toFixed(2)}
          </div>
        </div>

        <div className="panel-card">
          <div className="card-banner">COMPLETED ORDERS</div>
          <div className="stat-value">
            <Award size={24} color="var(--accent-orange)" />
            {analytics?.total_orders}
          </div>
        </div>

        <div className="panel-card">
          <div className="card-banner">ACTIVE RESTAURANTS</div>
          <div className="stat-value">
            <Store size={24} color="var(--accent-violet)" />
            {analytics?.total_restaurants}
          </div>
        </div>

        <div className="panel-card">
          <div className="card-banner">PLATFORM USERS</div>
          <div className="stat-value">
            <Users size={24} color="var(--accent-orange)" />
            {analytics?.total_users}
          </div>
        </div>
      </div>

      <div className="two-column-layout">
        {/* Left Side - Restaurant Auditing */}
        <div className="panel-card">
          <div className="panel-heading">
            <ShieldAlert size={18} color="var(--accent-orange)" /> Restaurant
            Auditing Board
          </div>

          <div className="card-stack">
            {restaurants.map((r) => (
              <div
                key={r.id}
                className={`card-row-compact audit-row ${
                  r.is_verified ? "verified" : "pending"
                }`}
              >
                <div>
                  <strong>{r.name}</strong>
                  <div className="text-muted text-small">{r.description}</div>
                </div>

                {r.is_verified ? (
                  <span className="status-pill success">VERIFIED</span>
                ) : (
                  <button
                    onClick={() => handleVerifyRestaurant(r.id)}
                    className="btn-premium btn-sm button-stretch"
                  >
                    Verify Store
                  </button>
                )}
              </div>
            ))}

            {restaurants.length === 0 && (
              <div className="empty-state">
                No restaurants found in database.
              </div>
            )}
          </div>
        </div>

        {/* Right Side - Coupon Manager */}
        <div className="card-stack">
          {/* Create Coupon */}
          <div className="panel-card">
            <div className="panel-heading">
              <Tag size={18} color="var(--accent-violet)" /> Add Promo Coupon
            </div>

            <form onSubmit={handleAddCoupon} className="form-grid">
              <input
                type="text"
                placeholder="Coupon Code (e.g. WELCOME50)"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                required
                className="input-premium"
              />

              <select
                value={discountType}
                onChange={(e: any) => setDiscountType(e.target.value)}
                className="input-premium"
              >
                <option value="percentage">Percentage (%)</option>
                <option value="fixed">Fixed Amount ($)</option>
              </select>

              <input
                type="number"
                placeholder="Discount Value"
                value={discountValue}
                onChange={(e) => setDiscountValue(e.target.value)}
                required
                className="input-premium"
              />

              <input
                type="number"
                placeholder="Minimum Order Value ($)"
                value={minOrder}
                onChange={(e) => setMinOrder(e.target.value)}
                className="input-premium"
              />

              <button
                type="submit"
                disabled={couponLoading}
                className="btn-premium btn-sm button-stretch"
              >
                {couponLoading ? "Creating..." : "Save Coupon"}
              </button>
            </form>
          </div>

          {/* Active Coupons List */}
          <div className="panel-card compact">
            <div className="card-heading-small">Active Coupons</div>
            <div className="card-stack">
              {coupons.map((c) => (
                <div key={c.id} className="card-row-compact">
                  <div>
                    <strong className="text-small">{c.code}</strong>
                    <div className="text-muted" style={{ fontSize: "0.8rem" }}>
                      {c.discount_value}
                      {c.discount_type === "percentage" ? "%" : "$"} off (Min: $
                      {c.min_order_amount})
                    </div>
                  </div>
                  <button
                    onClick={() => handleDeleteCoupon(c.id)}
                    className="icon-button-danger"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}

              {coupons.length === 0 && (
                <div className="empty-state text-small">
                  No active promo codes.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
