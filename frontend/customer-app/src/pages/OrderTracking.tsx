import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { io, Socket } from "socket.io-client";
import {
  ShieldCheck,
  Truck,
  CookingPot,
  Utensils,
  CheckCircle,
} from "lucide-react";
import { toast } from "sonner";
import api from "../../../shared/services/api";
import { FeedbackModal } from "../components/FeedbackModal";

interface DriverLocation {
  latitude: number;
  longitude: number;
}

export const OrderTracking: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const [status, setStatus] = useState<
    "placed" | "preparing" | "ready" | "out_for_delivery" | "delivered"
  >("placed");
  const [driverLoc, setDriverLoc] = useState<DriverLocation | null>(null);
  const [driverName, setDriverName] = useState<string | null>(null);
  const [driverPhone, setDriverPhone] = useState<string | null>(null);
  const [feedbackOpen, setFeedbackOpen] = useState(false);

  useEffect(() => {
    // 1. Fetch current database state initially
    const fetchOrderStatus = async () => {
      try {
        const response = await api.get(`/orders/${orderId}`);
        if (response.data.status === "success") {
          const order = response.data.data;
          setStatus(order.status);
          if (order.status === "delivered") {
            setFeedbackOpen(true);
          }
          if (order.driver_first_name) {
            setDriverName(
              `${order.driver_first_name} ${order.driver_last_name || ""}`,
            );
            setDriverPhone(order.driver_phone);
          }
        }
      } catch (err) {
        console.error("Fetch order tracking state error:", err);
      }
    };
    fetchOrderStatus();

    // 2. Bind Socket.IO client connections
    const socket: Socket = io("http://localhost:5000");

    socket.on("connect", () => {
      console.log("Connected to real-time telemetry stream");
      socket.emit("joinRoom", { room: `order_${orderId}` });
    });

    socket.on(
      "orderStatusUpdated",
      (data: { status: typeof status; driver?: any }) => {
        setStatus(data.status);
        if (data.status === "delivered") {
          setFeedbackOpen(true);
        }
        if (data.driver) {
          setDriverName(
            `${data.driver.first_name} ${data.driver.last_name || ""}`,
          );
          setDriverPhone(data.driver.phone);
        }
        toast.info(
          `Order Status Update: ${data.status.replace("_", " ").toUpperCase()}`,
        );
      },
    );

    socket.on("driverLocationUpdated", (data: DriverLocation) => {
      setDriverLoc(data);
    });

    socket.on("disconnect", () => {
      console.log("Disconnected from telemetry stream");
    });

    return () => {
      socket.disconnect();
    };
  }, [orderId]);

  const steps = [
    { key: "placed", label: "Placed", icon: <ShieldCheck size={20} /> },
    { key: "preparing", label: "Preparing", icon: <CookingPot size={20} /> },
    { key: "ready", label: "Ready", icon: <Utensils size={20} /> },
    {
      key: "out_for_delivery",
      label: "Out for Delivery",
      icon: <Truck size={20} />,
    },
    { key: "delivered", label: "Delivered", icon: <CheckCircle size={20} /> },
  ];

  const getStepIndex = (s: string) => {
    const indices: { [key: string]: number } = {
      placed: 0,
      preparing: 1,
      ready: 2,
      out_for_delivery: 3,
      delivered: 4,
    };
    return indices[s] !== undefined ? indices[s] : 0;
  };

  const activeIndex = getStepIndex(status);

  return (
    <div style={{ padding: "40px", maxWidth: "800px", margin: "0 auto" }}>
      <h1 style={{ fontSize: "2.5rem", marginBottom: "8px" }}>Track Order</h1>
      <p
        style={{
          color: "var(--text-muted)",
          fontSize: "0.95rem",
          marginBottom: "40px",
        }}
      >
        Order ID: <strong>{orderId}</strong>
      </p>

      {/* Progress pipeline (Apple-style frosted glass) */}
      <div
        style={{
          background: "var(--glass-bg)",
          border: "1px solid var(--glass-border)",
          borderRadius: "var(--radius-squircle)",
          padding: "40px",
          boxShadow: "var(--glass-shadow)",
          backdropFilter: "var(--glass-blur)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          position: "relative",
          marginBottom: "40px",
        }}
      >
        {/* Background connector line */}
        <div
          style={{
            position: "absolute",
            left: "60px",
            right: "60px",
            height: "4px",
            background: "#E0E0E0",
            zIndex: 1,
          }}
        />
        {/* Active colored connector line */}
        <div
          style={{
            position: "absolute",
            left: "60px",
            width: `${(activeIndex / 4) * 82}%`,
            height: "4px",
            background: "var(--primary-gradient)",
            zIndex: 2,
            transition: "width 0.4s ease",
          }}
        />

        {steps.map((step, idx) => {
          const isPassed = idx <= activeIndex;
          return (
            <div
              key={step.key}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "12px",
                zIndex: 3,
              }}
            >
              <div
                style={{
                  width: "48px",
                  height: "48px",
                  borderRadius: "50%",
                  background: isPassed ? "var(--primary-gradient)" : "#FFF",
                  color: isPassed ? "var(--text-sand)" : "var(--text-slate)",
                  border: isPassed ? "none" : "2px solid var(--glass-border)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: isPassed
                    ? "0 4px 15px rgba(255, 90, 31, 0.3)"
                    : "none",
                  transition: "all 0.3s ease",
                }}
              >
                {step.icon}
              </div>
              <span
                style={{
                  fontSize: "0.85rem",
                  fontWeight: isPassed ? 700 : 500,
                  color: isPassed ? "var(--text-slate)" : "var(--text-muted)",
                }}
              >
                {step.label}
              </span>
            </div>
          );
        })}
      </div>

      {/* Driver info and map simulation */}
      {driverName && (
        <div
          style={{
            background: "#FFF",
            border: "1px solid var(--glass-border)",
            borderRadius: "var(--radius-standard)",
            padding: "24px",
            boxShadow: "var(--glass-shadow)",
            marginBottom: "40px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div>
            <h4
              style={{
                fontFamily: "var(--font-cohere)",
                fontSize: "1.1rem",
                marginBottom: "4px",
              }}
            >
              Your Delivery Partner
            </h4>
            <div style={{ fontWeight: 700, fontSize: "1rem" }}>
              {driverName}
            </div>
            <div style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>
              {driverPhone}
            </div>
          </div>
          <div
            style={{
              background: "rgba(138, 43, 226, 0.08)",
              color: "var(--accent-violet)",
              padding: "8px 16px",
              borderRadius: "100px",
              fontWeight: 700,
              fontSize: "0.85rem",
            }}
          >
            On the way
          </div>
        </div>
      )}

      {/* Map simulation container */}
      <div
        style={{
          height: "320px",
          background: "#EAEAEA",
          borderRadius: "var(--radius-squircle)",
          border: "1px solid var(--glass-border)",
          overflow: "hidden",
          position: "relative",
          boxShadow: "var(--glass-shadow)",
        }}
      >
        {/* Placeholder map background */}
        <div
          style={{
            width: "100%",
            height: "100%",
            background:
              "radial-gradient(circle, #E5E5E5 10%, transparent 10.5%), radial-gradient(circle, #E5E5E5 10%, transparent 10.5%)",
            backgroundSize: "20px 20px",
            backgroundPosition: "0 0, 10px 10px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              color: "var(--text-muted)",
              fontWeight: 600,
              fontSize: "0.95rem",
              textAlign: "center",
            }}
          >
            🛰️ Real-time Telemetry Map Active
            {driverLoc ? (
              <div
                style={{
                  fontSize: "0.8rem",
                  marginTop: "8px",
                  color: "var(--text-slate)",
                }}
              >
                Driver coordinates: {driverLoc.latitude.toFixed(6)},{" "}
                {driverLoc.longitude.toFixed(6)}
              </div>
            ) : (
              <div style={{ fontSize: "0.8rem", marginTop: "8px" }}>
                Waiting for driver GPS stream...
              </div>
            )}
          </div>
        </div>

        {/* Home icon */}
        <div
          style={{
            position: "absolute",
            bottom: "40px",
            right: "60px",
            background: "var(--accent-orange)",
            color: "#FFF",
            padding: "6px 12px",
            borderRadius: "6px",
            fontWeight: 700,
            fontSize: "0.8rem",
          }}
        >
          🏠 Destination
        </div>

        {/* Restaurant icon */}
        <div
          style={{
            position: "absolute",
            top: "40px",
            left: "60px",
            background: "var(--text-slate)",
            color: "#FFF",
            padding: "6px 12px",
            borderRadius: "6px",
            fontWeight: 700,
            fontSize: "0.8rem",
          }}
        >
          🍳 Restaurant
        </div>

        {/* Driver dot indicator */}
        {driverLoc && (
          <div
            style={{
              position: "absolute",
              top: `${160 + (driverLoc.latitude - 12.9716) * 10000}px`,
              left: `${400 + (driverLoc.longitude - 77.5946) * 10000}px`,
              width: "20px",
              height: "20px",
              borderRadius: "50%",
              background: "var(--accent-violet)",
              border: "3px solid #FFF",
              boxShadow: "0 0 10px rgba(138, 43, 226, 0.8)",
              transition: "all 0.5s ease",
            }}
          />
        )}
      </div>

      {status === "delivered" && (
        <button
          onClick={() => setFeedbackOpen(true)}
          className="btn-premium"
          style={{
            width: "100%",
            marginTop: "24px",
            padding: "14px",
            textAlign: "center",
            background: "var(--accent-orange)",
          }}
        >
          🌟 Rate Your Experience
        </button>
      )}

      <button
        onClick={() => navigate("/")}
        className="btn-premium"
        style={{
          width: "100%",
          marginTop: "16px",
          padding: "14px",
          textAlign: "center",
        }}
      >
        Back to Dashboard
      </button>

      <FeedbackModal
        isOpen={feedbackOpen}
        onClose={() => setFeedbackOpen(false)}
        orderId={orderId!}
      />
    </div>
  );
};
