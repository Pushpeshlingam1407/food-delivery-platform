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
  const [minOrder, setMinOrder] = useState("0");
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
        min_order_amount: parseFloat(minOrder),
        start_date: new Date().toISOString().slice(0, 10),
        end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
          .toISOString()
          .slice(0, 10),
      });

      if (response.data.status === "success") {
        toast.success("Promo coupon created successfully!");
        setCode("");
        setDiscountValue("");
        setMinOrder("0");
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
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "80vh",
        }}
      >
        <p style={{ color: "var(--text-muted)" }}>
          Loading system dashboard...
        </p>
      </div>
    );
  }

  return (
    <div style={{ padding: "40px", maxWidth: "1200px", margin: "0 auto" }}>
      {/* Page Title */}
      <div style={{ marginBottom: "40px" }}>
        <h1
          style={{
            fontSize: "2.2rem",
            marginBottom: "8px",
            fontFamily: "var(--font-anthropic)",
          }}
        >
          Administrator Console
        </h1>
        <p style={{ color: "var(--text-muted)" }}>
          Overview of platform analytics, restaurant audits, and system
          configuration.
        </p>
      </div>

      {/* Analytics Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "24px",
          marginBottom: "40px",
        }}
      >
        <div
          style={{
            background: "var(--glass-bg)",
            border: "1px solid var(--glass-border)",
            borderRadius: "var(--radius-squircle)",
            padding: "24px",
            backdropFilter: "var(--glass-blur)",
          }}
        >
          <div
            style={{
              color: "var(--text-muted)",
              fontSize: "0.8rem",
              fontWeight: 700,
              marginBottom: "8px",
            }}
          >
            CAPTURED REVENUE
          </div>
          <div
            style={{
              fontSize: "1.8rem",
              fontWeight: 800,
              display: "flex",
              alignItems: "center",
              gap: "4px",
              color: "#4CAF50",
            }}
          >
            <DollarSign size={24} />
            {analytics?.total_payments_captured.toFixed(2)}
          </div>
        </div>

        <div
          style={{
            background: "var(--glass-bg)",
            border: "1px solid var(--glass-border)",
            borderRadius: "var(--radius-squircle)",
            padding: "24px",
            backdropFilter: "var(--glass-blur)",
          }}
        >
          <div
            style={{
              color: "var(--text-muted)",
              fontSize: "0.8rem",
              fontWeight: 700,
              marginBottom: "8px",
            }}
          >
            COMPLETED ORDERS
          </div>
          <div
            style={{
              fontSize: "1.8rem",
              fontWeight: 800,
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <Award size={24} color="var(--accent-orange)" />
            {analytics?.total_orders}
          </div>
        </div>

        <div
          style={{
            background: "var(--glass-bg)",
            border: "1px solid var(--glass-border)",
            borderRadius: "var(--radius-squircle)",
            padding: "24px",
            backdropFilter: "var(--glass-blur)",
          }}
        >
          <div
            style={{
              color: "var(--text-muted)",
              fontSize: "0.8rem",
              fontWeight: 700,
              marginBottom: "8px",
            }}
          >
            ACTIVE RESTAURANTS
          </div>
          <div
            style={{
              fontSize: "1.8rem",
              fontWeight: 800,
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <Store size={24} color="var(--accent-violet)" />
            {analytics?.total_restaurants}
          </div>
        </div>

        <div
          style={{
            background: "var(--glass-bg)",
            border: "1px solid var(--glass-border)",
            borderRadius: "var(--radius-squircle)",
            padding: "24px",
            backdropFilter: "var(--glass-blur)",
          }}
        >
          <div
            style={{
              color: "var(--text-muted)",
              fontSize: "0.8rem",
              fontWeight: 700,
              marginBottom: "8px",
            }}
          >
            PLATFORM USERS
          </div>
          <div
            style={{
              fontSize: "1.8rem",
              fontWeight: 800,
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <Users size={24} color="var(--accent-orange)" />
            {analytics?.total_users}
          </div>
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 400px",
          gap: "40px",
        }}
      >
        {/* Left Side - Restaurant Auditing */}
        <div
          style={{
            background: "#FFF",
            border: "1px solid var(--glass-border)",
            borderRadius: "var(--radius-standard)",
            padding: "32px",
            boxShadow: "var(--glass-shadow)",
          }}
        >
          <h3
            style={{
              fontSize: "1.2rem",
              fontWeight: 700,
              marginBottom: "24px",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <ShieldAlert size={18} color="var(--accent-orange)" /> Restaurant
            Auditing Board
          </h3>

          <div
            style={{ display: "flex", flexDirection: "column", gap: "16px" }}
          >
            {restaurants.map((r) => (
              <div
                key={r.id}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "16px",
                  border: "1px solid var(--glass-border)",
                  borderRadius: "8px",
                  background: r.is_verified
                    ? "rgba(76, 175, 80, 0.02)"
                    : "rgba(255, 90, 31, 0.02)",
                }}
              >
                <div>
                  <strong>{r.name}</strong>
                  <div
                    style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}
                  >
                    {r.description}
                  </div>
                </div>

                {r.is_verified ? (
                  <span
                    style={{
                      fontSize: "0.8rem",
                      fontWeight: 700,
                      color: "#4CAF50",
                      padding: "4px 10px",
                      background: "rgba(76, 175, 80, 0.08)",
                      borderRadius: "100px",
                    }}
                  >
                    VERIFIED
                  </span>
                ) : (
                  <button
                    onClick={() => handleVerifyRestaurant(r.id)}
                    className="btn-premium"
                    style={{ padding: "6px 14px", fontSize: "0.8rem" }}
                  >
                    Verify Store
                  </button>
                )}
              </div>
            ))}

            {restaurants.length === 0 && (
              <div
                style={{
                  textAlign: "center",
                  padding: "40px",
                  color: "var(--text-muted)",
                }}
              >
                No restaurants found in database.
              </div>
            )}
          </div>
        </div>

        {/* Right Side - Coupon Manager */}
        <div style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
          {/* Create Coupon */}
          <div
            style={{
              background: "var(--glass-bg)",
              border: "1px solid var(--glass-border)",
              borderRadius: "var(--radius-squircle)",
              padding: "32px",
              boxShadow: "var(--glass-shadow)",
            }}
          >
            <h3
              style={{
                fontSize: "1.2rem",
                fontWeight: 700,
                marginBottom: "20px",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <Tag size={18} color="var(--accent-violet)" /> Add Promo Coupon
            </h3>

            <form
              onSubmit={handleAddCoupon}
              style={{ display: "flex", flexDirection: "column", gap: "12px" }}
            >
              <input
                type="text"
                placeholder="Coupon Code (e.g. WELCOME50)"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                required
                style={{
                  padding: "10px",
                  borderRadius: "6px",
                  border: "1px solid var(--glass-border)",
                  outline: "none",
                }}
              />

              <select
                value={discountType}
                onChange={(e: any) => setDiscountType(e.target.value)}
                style={{
                  padding: "10px",
                  borderRadius: "6px",
                  border: "1px solid var(--glass-border)",
                  outline: "none",
                }}
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
                style={{
                  padding: "10px",
                  borderRadius: "6px",
                  border: "1px solid var(--glass-border)",
                  outline: "none",
                }}
              />

              <input
                type="number"
                placeholder="Minimum Order Value ($)"
                value={minOrder}
                onChange={(e) => setMinOrder(e.target.value)}
                style={{
                  padding: "10px",
                  borderRadius: "6px",
                  border: "1px solid var(--glass-border)",
                  outline: "none",
                }}
              />

              <button
                type="submit"
                disabled={couponLoading}
                className="btn-premium"
                style={{ padding: "10px", fontSize: "0.9rem" }}
              >
                {couponLoading ? "Creating..." : "Save Coupon"}
              </button>
            </form>
          </div>

          {/* Active Coupons List */}
          <div
            style={{
              background: "#FFF",
              border: "1px solid var(--glass-border)",
              borderRadius: "var(--radius-standard)",
              padding: "24px",
              boxShadow: "var(--glass-shadow)",
            }}
          >
            <h4
              style={{
                fontSize: "1rem",
                fontWeight: 700,
                marginBottom: "16px",
              }}
            >
              Active Coupons
            </h4>
            <div
              style={{ display: "flex", flexDirection: "column", gap: "10px" }}
            >
              {coupons.map((c) => (
                <div
                  key={c.id}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "12px",
                    border: "1px solid var(--glass-border)",
                    borderRadius: "6px",
                  }}
                >
                  <div>
                    <strong style={{ fontSize: "0.95rem" }}>{c.code}</strong>
                    <div
                      style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}
                    >
                      {c.discount_value}
                      {c.discount_type === "percentage" ? "%" : "$"} off (Min: $
                      {c.min_order_amount})
                    </div>
                  </div>
                  <button
                    onClick={() => handleDeleteCoupon(c.id)}
                    style={{
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      color: "#F44336",
                    }}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}

              {coupons.length === 0 && (
                <div
                  style={{
                    fontSize: "0.85rem",
                    color: "var(--text-muted)",
                    textAlign: "center",
                    padding: "12px",
                  }}
                >
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
