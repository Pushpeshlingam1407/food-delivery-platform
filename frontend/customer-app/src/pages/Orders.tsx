import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ShoppingBag, ChevronRight, Star } from "lucide-react";
import { toast } from "sonner";
import api from "../../../shared/services/api";
import { FeedbackModal } from "../components/FeedbackModal";

interface Order {
  id: string;
  order_number: string;
  restaurant_name: string;
  status:
    | "placed"
    | "preparing"
    | "ready_for_pickup"
    | "out_for_delivery"
    | "delivered"
    | "cancelled";
  total_payable: number;
  placed_at: string;
}

export const Orders: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<Order[]>([]);
  const [feedbackOrderId, setFeedbackOrderId] = useState<string | null>(null);
  const navigate = useNavigate();

  const fetchOrderHistory = async () => {
    try {
      const response = await api.get("/orders");
      if (response.data.status === "success") {
        setOrders(response.data.data || []);
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to load your order history.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrderHistory();
  }, []);

  const isActive = (status: string) => {
    return [
      "placed",
      "preparing",
      "ready_for_pickup",
      "out_for_delivery",
    ].includes(status);
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
        <p style={{ color: "var(--text-muted)" }}>Loading your orders...</p>
      </div>
    );
  }

  return (
    <div style={{ padding: "40px", maxWidth: "800px", margin: "0 auto" }}>
      <button onClick={() => navigate(-1)} className="back-button">
        ← Back
      </button>
      {/* Title */}
      <div style={{ marginBottom: "40px" }}>
        <h1
          style={{
            fontSize: "2.2rem",
            marginBottom: "8px",
            fontFamily: "var(--font-anthropic)",
          }}
        >
          My Orders
        </h1>
        <p style={{ color: "var(--text-muted)" }}>
          Track active deliveries and review your previous orders.
        </p>
      </div>

      {/* Orders List */}
      <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
        {orders.map((o) => (
          <div
            key={o.id}
            style={{
              background: "var(--glass-bg)",
              border: "1px solid var(--glass-border)",
              borderRadius: "var(--radius-standard)",
              padding: "24px",
              boxShadow: "var(--glass-shadow)",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  marginBottom: "6px",
                }}
              >
                <strong style={{ fontSize: "1.1rem" }}>
                  {o.restaurant_name}
                </strong>
                <span
                  style={{
                    padding: "3px 10px",
                    borderRadius: "100px",
                    fontSize: "0.75rem",
                    fontWeight: 700,
                    textTransform: "uppercase",
                    background: isActive(o.status)
                      ? "rgba(255, 90, 31, 0.08)"
                      : "rgba(25, 25, 25, 0.04)",
                    color: isActive(o.status)
                      ? "var(--accent-orange)"
                      : "var(--text-slate)",
                  }}
                >
                  {o.status.replace(/_/g, " ")}
                </span>
              </div>
              <div
                style={{
                  fontSize: "0.85rem",
                  color: "var(--text-muted)",
                  marginBottom: "12px",
                }}
              >
                Order #{o.order_number} •{" "}
                {new Date(o.placed_at).toLocaleString()}
              </div>
              <div style={{ fontSize: "1rem", fontWeight: 700 }}>
                Total Paid: ${parseFloat(o.total_payable.toString()).toFixed(2)}
              </div>
            </div>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "8px",
                alignItems: "end",
              }}
            >
              {isActive(o.status) ? (
                <button
                  onClick={() => navigate(`/track/${o.id}`)}
                  className="btn-premium"
                  style={{
                    padding: "10px 20px",
                    fontSize: "0.85rem",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                  }}
                >
                  Track Live <ChevronRight size={16} />
                </button>
              ) : o.status === "delivered" ? (
                <button
                  onClick={() => setFeedbackOrderId(o.id)}
                  className="btn-premium"
                  style={{
                    padding: "10px 20px",
                    fontSize: "0.85rem",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    background: "var(--accent-violet)",
                  }}
                >
                  Rate Order <Star size={14} />
                </button>
              ) : null}
            </div>
          </div>
        ))}

        {orders.length === 0 && (
          <div
            style={{
              textAlign: "center",
              padding: "60px",
              color: "var(--text-muted)",
            }}
          >
            <ShoppingBag
              size={48}
              style={{ marginBottom: "16px", color: "var(--glass-border)" }}
            />
            <p>You haven't placed any orders yet.</p>
            <button
              onClick={() => navigate("/")}
              className="btn-premium"
              style={{ marginTop: "16px" }}
            >
              Order Food Now
            </button>
          </div>
        )}
      </div>

      <FeedbackModal
        isOpen={feedbackOrderId !== null}
        onClose={() => setFeedbackOrderId(null)}
        orderId={feedbackOrderId || ""}
      />
    </div>
  );
};
