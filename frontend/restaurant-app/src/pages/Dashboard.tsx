import React, { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
import {
  CookingPot,
  CheckCircle,
  Clock,
  Check,
  Plus,
  Store,
  TrendingUp,
} from "lucide-react";
import notify from "../../../shared/utils/toast";
import api from "../../../shared/services/api";

import { PremiumPageHeader } from "../components/ui/PremiumPageHeader";
import { CredStatCard } from "../components/ui/CredStatCard";
import "../restaurant-premium.css";

interface Order {
  id: string;
  order_number: string;
  status:
    | "placed"
    | "preparing"
    | "ready_for_pickup"
    | "out_for_delivery"
    | "delivered"
    | "cancelled";
  item_total: number;
  created_at: string;
  customer_first_name: string;
  customer_last_name: string;
}

const playOrderChime = () => {
  try {
    const AudioContext =
      window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();

    const playBeep = (time: number, freq: number, duration: number) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, time);
      gain.gain.setValueAtTime(0.15, time);
      gain.gain.exponentialRampToValueAtTime(0.0001, time + duration);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(time);
      osc.stop(time + duration);
    };

    const now = ctx.currentTime;
    playBeep(now, 587.33, 0.35); // D5
    playBeep(now + 0.15, 880, 0.5); // A5
  } catch (err) {
    console.error("Failed to play audio chime:", err);
  }
};

export const Dashboard: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [restaurantId, setRestaurantId] = useState<string | null>(null);
  const [restaurantName, setRestaurantName] = useState<string | null>(null);
  const [restaurantStatus, setRestaurantStatus] = useState("closed");
  const [loading, setLoading] = useState(true);

  // Onboarding profile creation form states
  const [restName, setRestName] = useState("");
  const [restDesc, setRestDesc] = useState("");
  const [restAddress, setRestAddress] = useState("");
  const [restLandmark, setRestLandmark] = useState("");
  const [restCity, setRestCity] = useState("");
  const [restState, setRestState] = useState("");
  const [restPostalCode, setRestPostalCode] = useState("");
  const [restOpenTime, setRestOpenTime] = useState("11:00:00");
  const [restCloseTime, setRestCloseTime] = useState("23:00:00");
  const [createLoading, setCreateLoading] = useState(false);

  const fetchRestaurantAndOrders = async () => {
    setLoading(true);
    try {
      const meRes = await api.get("/auth/me");
      const myRestaurant = meRes.data.data?.restaurant;

      if (myRestaurant) {
        setRestaurantId(myRestaurant.id);
        setRestaurantName(myRestaurant.name);
        setRestaurantStatus(myRestaurant.status);

        // Fetch orders for this restaurant
        const ordersRes = await api.get(`/orders`);
        if (ordersRes.data.status === "success") {
          setOrders(
            ordersRes.data.data.filter(
              (o: any) => o.restaurant_id === myRestaurant.id,
            ),
          );
        }
      }
    } catch (err) {
      console.error("Fetch dashboard data failed:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRestaurantAndOrders();
  }, []);

  // Connect Socket.IO listeners
  useEffect(() => {
    if (!restaurantId) return;

    const socket: Socket = io("http://localhost:5000");

    socket.on("connect", () => {
      console.log("Connected to real-time merchant network");
      socket.emit("joinRoom", { room: `restaurant_${restaurantId}` });
    });

    socket.on("newOrderReceived", (newOrder: Order) => {
      setOrders((prev) => [newOrder, ...prev]);
      playOrderChime();
      notify.success(
        `New Order Received! Order #${newOrder.order_number} for $${newOrder.item_total} placed.`,
      );
    });

    return () => {
      socket.disconnect();
    };
  }, [restaurantId]);

  const handleUpdateStatus = async (orderId: string, newStatus: string) => {
    try {
      const response = await api.put(`/orders/${orderId}/status`, {
        status: newStatus,
      });
      if (response.data.status === "success") {
        setOrders((prev) =>
          prev.map((o) =>
            o.id === orderId ? { ...o, status: newStatus as any } : o,
          ),
        );
        notify.success(
          `Order is now ${newStatus.replace("_", " ").toUpperCase()}`,
        );
      }
    } catch (err) {
      notify.error("We couldn't update this order.");
    }
  };

  const toggleRestaurantOpen = async () => {
    if (!restaurantId) return;
    const nextStatus = restaurantStatus === "open" ? "closed" : "open";
    try {
      const response = await api.put(`/restaurants/${restaurantId}`, {
        status: nextStatus,
      });
      if (response.data.status === "success") {
        setRestaurantStatus(nextStatus);
        if (nextStatus === "open") {
          notify.success("Your restaurant is online and ready for orders.");
        } else {
          notify.error("Your restaurant is offline.");
        }
      }
    } catch (err) {
      notify.error("We couldn't change your status right now.");
    }
  };

  const handleCreateRestaurant = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !restName ||
      !restAddress ||
      !restCity ||
      !restState ||
      !restPostalCode
    ) {
      notify.warning("Please fill out all fields.");
      return;
    }
    setCreateLoading(true);
    try {
      const response = await api.post("/restaurants", {
        name: restName,
        description: restDesc,
        street_address: restAddress,
        landmark: restLandmark,
        city: restCity,
        state: restState,
        postal_code: restPostalCode,
        opening_time: restOpenTime,
        closing_time: restCloseTime,
      });
      if (response.data.status === "success") {
        notify.success("Restaurant profile created.");
        fetchRestaurantAndOrders();
      }
    } catch (error: any) {
      console.error(error);
      notify.error(
        error.response?.data?.message || "We couldn't create your profile.",
      );
    } finally {
      setCreateLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: "40px", color: "var(--cred-text-secondary)", textAlign: "center" }}>
        Loading restaurant dashboard...
      </div>
    );
  }

  // Onboarding UI if no restaurant profile found
  if (!restaurantId) {
    return (
      <div className="restaurant-premium-layout" style={{ padding: "40px 20px" }}>
        <div style={{ maxWidth: "600px", margin: "0 auto" }} className="cred-stat-card">
          <div style={{ textAlign: "center", marginBottom: "32px" }}>
            <Store size={48} style={{ color: "var(--cred-accent)", marginBottom: "16px" }} />
            <h1 style={{ fontSize: "2rem", fontWeight: 800, marginBottom: "8px", color: "var(--cred-text-primary)" }}>
              Setup Your Restaurant
            </h1>
            <p style={{ color: "var(--cred-text-secondary)" }}>
              Create your business profile to begin managing menus and receiving orders.
            </p>
          </div>

          <form onSubmit={handleCreateRestaurant} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            <div className="neo-input-wrapper">
              <input
                type="text"
                value={restName}
                onChange={(e) => setRestName(e.target.value)}
                placeholder=" "
                required
                className="neo-input"
              />
              <label>Restaurant Name *</label>
            </div>

            <div className="neo-input-wrapper">
              <textarea
                value={restDesc}
                onChange={(e) => setRestDesc(e.target.value)}
                placeholder=" "
                className="neo-input"
                style={{ height: "100px", resize: "none" }}
              />
              <label>Description</label>
            </div>

            <div className="neo-input-wrapper">
              <input
                type="text"
                value={restAddress}
                onChange={(e) => setRestAddress(e.target.value)}
                placeholder=" "
                required
                className="neo-input"
              />
              <label>Street Address *</label>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
              <div className="neo-input-wrapper">
                <input
                  type="text"
                  value={restLandmark}
                  onChange={(e) => setRestLandmark(e.target.value)}
                  placeholder=" "
                  className="neo-input"
                />
                <label>Landmark</label>
              </div>
              <div className="neo-input-wrapper">
                <input
                  type="text"
                  value={restCity}
                  onChange={(e) => setRestCity(e.target.value)}
                  placeholder=" "
                  required
                  className="neo-input"
                />
                <label>City *</label>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
              <div className="neo-input-wrapper">
                <input
                  type="text"
                  value={restState}
                  onChange={(e) => setRestState(e.target.value)}
                  placeholder=" "
                  required
                  className="neo-input"
                />
                <label>State *</label>
              </div>
              <div className="neo-input-wrapper">
                <input
                  type="text"
                  value={restPostalCode}
                  onChange={(e) => setRestPostalCode(e.target.value)}
                  placeholder=" "
                  required
                  className="neo-input"
                />
                <label>Postal Code *</label>
              </div>
            </div>

            <button
              type="submit"
              disabled={createLoading}
              className="neo-btn neo-btn-primary"
              style={{ width: "100%" }}
            >
              {createLoading ? "Creating Profile..." : "Create Restaurant Profile"}
            </button>
          </form>
        </div>
      </div>
    );
  }

  const activeOrdersCount = orders.filter((o) => o.status !== "delivered" && o.status !== "cancelled").length;
  const pendingOrdersCount = orders.filter((o) => o.status === "placed").length;
  const estimatedRevenue = orders
    .reduce((acc, o) => acc + parseFloat(o.item_total?.toString() || "0"), 0);

  return (
    <div className="restaurant-premium-layout" style={{ padding: "40px 20px" }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        
        {/* Header Panel */}
        <PremiumPageHeader 
          title={restaurantName || "Active Orders"}
          subtitle={restaurantName ? `Realtime Order Control for ${restaurantName}` : "Realtime dispatch control panel"}
          rightAction={
            <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
              <span className="premium-badge neutral" style={{ border: "1px solid var(--cred-border)", padding: "10px 16px" }}>
                Store: <strong style={{ color: restaurantStatus === "open" ? "var(--cred-success)" : "var(--cred-accent)", marginLeft: "4px" }}>{restaurantStatus.toUpperCase()}</strong>
              </span>
              <button
                onClick={toggleRestaurantOpen}
                className={`neo-btn ${restaurantStatus === "open" ? "neo-btn-accent" : "neo-btn-primary"}`}
                style={{ padding: "10px 20px", fontSize: "0.9rem" }}
              >
                {restaurantStatus === "open" ? "Go Offline" : "Go Online"}
              </button>
            </div>
          }
        />

        {/* Stats strip using CredStatCard */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "24px", marginBottom: "40px" }} className="premium-animate-in">
          <CredStatCard 
            title="Total Orders"
            value={orders.length}
            subtitle="Today's total orders received"
            icon={<CookingPot />}
          />
          <CredStatCard 
            title="Pending Orders"
            value={pendingOrdersCount}
            subtitle="Need acceptance action"
            icon={<Clock />}
            theme={pendingOrdersCount > 0 ? "warning" : "default"}
          />
          <CredStatCard 
            title="Estimated Revenue"
            value={`$${estimatedRevenue.toFixed(2)}`}
            subtitle="Gross value of today's sales"
            icon={<TrendingUp />}
            theme="success"
          />
        </div>

        {/* Grid list of active orders */}
        <h3 style={{ fontSize: "1.1rem", fontWeight: 800, color: "var(--cred-text-primary)", marginBottom: "20px", letterSpacing: "1px", textTransform: "uppercase" }}>
          Active Orders Queue ({activeOrdersCount})
        </h3>
        
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(350px, 1fr))", gap: "24px" }} className="premium-animate-in">
          {orders.map((o) => {
            const isCompleted = o.status === "delivered" || o.status === "cancelled";
            const badgeTheme = o.status === "placed" ? "danger" : o.status === "preparing" ? "warning" : "success";

            return (
              <div key={o.id} className="cred-stat-card" style={{ minHeight: "auto", padding: "24px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px" }}>
                  <div>
                    <h4 style={{ margin: 0, fontSize: "1.1rem", fontWeight: 800 }}>Order #{String(o.order_number || o.id || "").slice(-6)}</h4>
                    <span style={{ fontSize: "0.8rem", color: "var(--cred-text-secondary)" }}>
                      {new Date(o.created_at).toLocaleTimeString()}
                    </span>
                  </div>
                  <span className={`premium-badge ${badgeTheme}`}>
                    {o.status.replace("_", " ")}
                  </span>
                </div>

                <div style={{ fontSize: "0.9rem", color: "var(--cred-text-primary)", marginBottom: "16px" }}>
                  Customer: <strong>{o.customer_first_name} {o.customer_last_name}</strong>
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "auto", pt: "12px", borderTop: "1px solid var(--cred-border)" }}>
                  <span style={{ fontSize: "1.25rem", fontWeight: 800 }}>
                    ${parseFloat((o.item_total ?? 0).toString()).toFixed(2)}
                  </span>

                  <div>
                    {o.status === "placed" && (
                      <button
                        onClick={() => handleUpdateStatus(o.id, "preparing")}
                        className="neo-btn neo-btn-primary"
                        style={{ padding: "8px 16px", fontSize: "0.85rem" }}
                      >
                        Accept Order
                      </button>
                    )}

                    {o.status === "preparing" && (
                      <button
                        onClick={() => handleUpdateStatus(o.id, "ready_for_pickup")}
                        className="neo-btn neo-btn-accent"
                        style={{ padding: "8px 16px", fontSize: "0.85rem" }}
                      >
                        Ready for Pickup
                      </button>
                    )}

                    {o.status === "ready_for_pickup" && (
                      <span style={{ fontSize: "0.85rem", color: "var(--cred-text-secondary)", display: "flex", alignItems: "center", gap: "6px" }}>
                        <Clock size={16} /> Waiting for pickup
                      </span>
                    )}

                    {o.status === "out_for_delivery" && (
                      <span style={{ fontSize: "0.85rem", color: "var(--cred-info)", display: "flex", alignItems: "center", gap: "6px", fontWeight: 600 }}>
                        <Clock size={16} /> Out for delivery
                      </span>
                    )}

                    {o.status === "delivered" && (
                      <span style={{ fontSize: "0.85rem", color: "var(--cred-success)", display: "flex", alignItems: "center", gap: "6px", fontWeight: 600 }}>
                        <Check size={16} /> Delivered
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {orders.length === 0 && (
            <div
              style={{
                padding: "60px",
                gridColumn: "1 / -1",
                textAlign: "center",
                color: "var(--cred-text-secondary)",
                background: "var(--cred-surface)",
                borderRadius: "16px",
                border: "1px solid var(--cred-border)",
              }}
            >
              No orders received today.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
