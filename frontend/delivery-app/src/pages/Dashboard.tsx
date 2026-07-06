import React, { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
import {
  Truck,
  Check,
  Power,
  DollarSign,
  Navigation,
  ArrowUpRight,
  Clock,
  FileText,
} from "lucide-react";
import { toast } from "sonner";
import api from "../../../shared/services/api";

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
  total_amount: number;
  restaurant_name: string;
  street_address: string;
  city: string;
}

export const Dashboard: React.FC = () => {
  const [isOnline, setIsOnline] = useState(false);
  const [jobs, setJobs] = useState<Order[]>([]);
  const [activeJob, setActiveJob] = useState<Order | null>(null);
  const [walletBalance, setWalletBalance] = useState(0);
  const [socket, setSocket] = useState<Socket | null>(null);

  // Payout and Transaction history states
  const [payoutAmount, setPayoutAmount] = useState("");
  const [payoutLoading, setPayoutLoading] = useState(false);
  const [transactions, setTransactions] = useState<any[]>([]);

  useEffect(() => {
    const fetchDriverStats = async () => {
      try {
        const meRes = await api.get("/auth/me");
        if (meRes.data.status === "success" && meRes.data.data) {
          setIsOnline(!!meRes.data.data.is_online);
        }

        const walletRes = await api.get("/wallets");
        if (walletRes.data.status === "success") {
          setWalletBalance(parseFloat(walletRes.data.data.balance || "0"));
          setTransactions(walletRes.data.data.transactions || []);
        }

        const ordersRes = await api.get("/orders");
        if (ordersRes.data.status === "success") {
          const allOrders = ordersRes.data.data;

          // Filter jobs ready for pickup
          setJobs(allOrders.filter((o: any) => o.status === "ready_for_pickup"));

          // Find if there is an active delivery job currently assigned to this driver
          const active = allOrders.find(
            (o: any) => o.status === "out_for_delivery",
          );
          if (active) {
            setActiveJob(active);
          }
        }
      } catch (err) {
        console.error("Fetch driver stats failed:", err);
      }
    };

    fetchDriverStats();

    // Bind Socket.IO client connections
    const ioSocket: Socket = io("http://localhost:5000");
    setSocket(ioSocket);

    return () => {
      ioSocket.disconnect();
    };
  }, []);

  const handleToggleOnline = async () => {
    const nextOnlineState = !isOnline;
    try {
      const response = await api.put("/delivery/status", {
        is_online: nextOnlineState,
      });
      if (response.data.status === "success") {
        setIsOnline(nextOnlineState);
        toast.success(
          `You are now ${nextOnlineState ? "ONLINE" : "OFFLINE"} for deliveries.`,
        );
      }
    } catch (err) {
      toast.error("Failed to update online shift status.");
    }
  };

  const handleAcceptJob = async (orderId: string) => {
    try {
      const response = await api.put(`/orders/${orderId}/status`, {
        status: "out_for_delivery",
      });
      if (response.data.status === "success") {
        const ordersRes = await api.get("/orders");
        if (ordersRes.data.status === "success") {
          const updatedOrder = ordersRes.data.data.find(
            (o: any) => o.id === orderId,
          );
          setActiveJob(updatedOrder);
          setJobs((prev) => prev.filter((j) => j.id !== orderId));
          toast.success("Logistics job accepted successfully!");

          // Start simulating GPS movements
          if (socket) {
            socket.emit("joinRoom", { room: `order_${orderId}` });
            simulateGPSMovement(orderId);
          }
        }
      }
    } catch (err) {
      toast.error("Failed to accept job.");
    }
  };

  const handleDeliverJob = async (orderId: string) => {
    try {
      const response = await api.put(`/orders/${orderId}/status`, {
        status: "delivered",
      });
      if (response.data.status === "success") {
        setActiveJob(null);
        toast.success("Order delivered successfully!", {
          description: "Delivery earnings credited to your wallet.",
        });

        // Refresh wallet balance
        const walletRes = await api.get("/wallets");
        if (walletRes.data.status === "success") {
          setWalletBalance(parseFloat(walletRes.data.data.balance || "0"));
          setTransactions(walletRes.data.data.transactions || []);
        }
      }
    } catch (err) {
      toast.error("Failed to complete delivery.");
    }
  };

  const handleRequestPayout = async (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(payoutAmount);
    if (isNaN(amt) || amt <= 0) {
      toast.error("Please enter a valid payout amount.");
      return;
    }
    if (amt > walletBalance) {
      toast.error("Insufficient balance for withdrawal request.");
      return;
    }

    setPayoutLoading(true);
    try {
      const response = await api.post("/wallets/payout", { amount: amt });
      if (response.data.status === "success") {
        toast.success("Payout transfer completed successfully!");
        setPayoutAmount("");

        // Refresh stats
        const walletRes = await api.get("/wallets");
        if (walletRes.data.status === "success") {
          setWalletBalance(parseFloat(walletRes.data.data.balance || "0"));
          setTransactions(walletRes.data.data.transactions || []);
        }
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to trigger payout.");
    } finally {
      setPayoutLoading(false);
    }
  };

  // Simulate moving GPS locations (broadcasting from driver to client via socket)
  const simulateGPSMovement = (orderId: string) => {
    let lat = 12.9716;
    let lon = 77.5946;
    let stepCount = 0;

    const interval = setInterval(() => {
      if (stepCount >= 10 || !activeJob) {
        clearInterval(interval);
        return;
      }

      lat += 0.0005;
      lon += 0.0005;
      stepCount++;

      if (socket) {
        socket.emit("updateLocation", {
          orderId,
          latitude: lat,
          longitude: lon,
        });
      }
    }, 4000);
  };

  return (
    <div style={{ padding: "40px", maxWidth: "1000px", margin: "0 auto" }}>
      {/* Header Info */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 340px",
          gap: "32px",
          marginBottom: "40px",
        }}
      >
        {/* Toggle block */}
        <div
          style={{
            background: "var(--glass-bg)",
            border: "1px solid var(--glass-border)",
            borderRadius: "var(--radius-squircle)",
            padding: "32px",
            boxShadow: "var(--glass-shadow)",
            backdropFilter: "var(--glass-blur)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div>
            <h1 style={{ fontSize: "2.2rem", marginBottom: "8px" }}>
              Logistics Panel
            </h1>
            <p style={{ color: "var(--text-muted)" }}>
              Status:{" "}
              <strong style={{ color: isOnline ? "#4CAF50" : "#F44336" }}>
                {isOnline ? "ONLINE" : "OFFLINE"}
              </strong>
            </p>
          </div>

          <button
            onClick={handleToggleOnline}
            className="btn-premium"
            style={{
              padding: "12px 28px",
              background: isOnline ? "#F44336" : "var(--primary-gradient)",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              boxShadow: "none",
            }}
          >
            <Power size={18} /> {isOnline ? "Go Offline" : "Go Online"}
          </button>
        </div>

        {/* Wallet block */}
        <div
          style={{
            background: "var(--glass-bg)",
            border: "1px solid var(--glass-border)",
            borderRadius: "var(--radius-squircle)",
            padding: "24px 32px",
            boxShadow: "var(--glass-shadow)",
            backdropFilter: "var(--glass-blur)",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
          }}
        >
          <div
            style={{
              display: "flex",
              justifycontent: "space-between",
              alignItems: "center",
            }}
          >
            <div>
              <div
                style={{
                  fontSize: "0.8rem",
                  fontWeight: 700,
                  color: "var(--text-muted)",
                  marginBottom: "4px",
                }}
              >
                MY WALLET
              </div>
              <div
                style={{
                  fontSize: "1.8rem",
                  fontWeight: 800,
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <DollarSign size={24} color="var(--accent-orange)" />
                {walletBalance.toFixed(2)}
              </div>
            </div>
          </div>

          {/* Cash payout Form */}
          <form
            onSubmit={handleRequestPayout}
            style={{ display: "flex", gap: "8px", marginTop: "16px" }}
          >
            <input
              type="number"
              step="0.01"
              value={payoutAmount}
              onChange={(e) => setPayoutAmount(e.target.value)}
              placeholder="Amount"
              required
              style={{
                padding: "8px 12px",
                width: "100px",
                borderRadius: "6px",
                border: "1px solid var(--glass-border)",
                fontSize: "0.85rem",
                outline: "none",
              }}
            />
            <button
              type="submit"
              disabled={payoutLoading}
              className="btn-premium"
              style={{
                padding: "8px 14px",
                fontSize: "0.8rem",
                flexGrow: 1,
              }}
            >
              {payoutLoading ? "Processing..." : "Cash Out"}
            </button>
          </form>
        </div>
      </div>

      {/* Active delivery job card */}
      {activeJob && (
        <div
          style={{
            background: "rgba(138, 43, 226, 0.04)",
            border: "2px solid var(--accent-violet)",
            borderRadius: "var(--radius-squircle)",
            padding: "32px",
            marginBottom: "40px",
          }}
        >
          <h2
            style={{
              fontSize: "1.6rem",
              marginBottom: "16px",
              color: "var(--accent-violet)",
            }}
          >
            Active Delivery Job
          </h2>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div>
              <strong style={{ fontSize: "1.2rem" }}>
                Order #{activeJob.order_number}
              </strong>
              <div
                style={{
                  color: "var(--text-muted)",
                  fontSize: "0.95rem",
                  marginTop: "4px",
                }}
              >
                Pickup: {activeJob.restaurant_name}
              </div>
              <div style={{ color: "var(--text-muted)", fontSize: "0.95rem" }}>
                Delivery Address: {activeJob.street_address}, {activeJob.city}
              </div>
            </div>

            <button
              onClick={() => handleDeliverJob(activeJob.id)}
              className="btn-premium"
              style={{
                background: "var(--accent-violet)",
                padding: "12px 28px",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <Check size={18} /> Confirm Handover/Delivery
            </button>
          </div>
        </div>
      )}

      {/* Dispatch Board Feed */}
      <h2 style={{ fontSize: "1.6rem", marginBottom: "24px" }}>
        Logistics Dispatch Feed
      </h2>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
          gap: "24px",
          marginBottom: "40px",
        }}
      >
        {jobs.map((job) => (
          <div
            key={job.id}
            style={{
              background: "#FFF",
              border: "1px solid var(--glass-border)",
              borderRadius: "var(--radius-standard)",
              padding: "24px",
              boxShadow: "var(--glass-shadow)",
              display: "flex",
              flexDirection: "column",
              gap: "16px",
            }}
          >
            <div style={{ display: "flex", justifycontent: "space-between" }}>
              <strong>Order #{job.order_number}</strong>
              <span style={{ color: "var(--accent-orange)", fontWeight: 700 }}>
                Pending Pickup
              </span>
            </div>

            <div
              style={{
                fontSize: "0.9rem",
                color: "var(--text-slate)",
                display: "flex",
                flexDirection: "column",
                gap: "6px",
              }}
            >
              <div>
                From: <strong>{job.restaurant_name}</strong>
              </div>
              <div>
                To: <strong>{job.street_address}</strong>
              </div>
            </div>

            <button
              onClick={() => handleAcceptJob(job.id)}
              disabled={!isOnline || !!activeJob}
              className="btn-premium"
              style={{
                width: "100%",
                padding: "10px",
                fontSize: "0.9rem",
                opacity: !isOnline || !!activeJob ? 0.6 : 1,
                cursor: !isOnline || !!activeJob ? "not-allowed" : "pointer",
              }}
            >
              Accept Delivery
            </button>
          </div>
        ))}

        {jobs.length === 0 && (
          <div
            style={{
              padding: "40px",
              gridColumn: "1 / -1",
              textAlign: "center",
              color: "var(--text-muted)",
            }}
          >
            No delivery jobs currently available.
          </div>
        )}
      </div>

      {/* Transaction History Ledger */}
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
          <FileText size={18} color="var(--accent-violet)" /> Wallet Transaction
          Log
        </h3>

        <div style={{ overflowX: "auto" }}>
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              textAlign: "left",
            }}
          >
            <thead>
              <tr
                style={{
                  borderBottom: "1px solid var(--glass-border)",
                  color: "var(--text-muted)",
                  fontSize: "0.85rem",
                  fontWeight: 700,
                }}
              >
                <th style={{ padding: "12px 16px" }}>DATE / TIME</th>
                <th style={{ padding: "12px 16px" }}>TYPE</th>
                <th style={{ padding: "12px 16px" }}>DESCRIPTION</th>
                <th style={{ padding: "12px 16px" }}>AMOUNT</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((tx: any) => (
                <tr
                  key={tx.id}
                  style={{
                    borderBottom: "1px solid var(--glass-border)",
                    fontSize: "0.95rem",
                  }}
                >
                  <td style={{ padding: "16px" }}>
                    {new Date(tx.created_at).toLocaleString()}
                  </td>
                  <td style={{ padding: "16px" }}>
                    <span
                      style={{
                        padding: "3px 8px",
                        borderRadius: "100px",
                        fontSize: "0.8rem",
                        fontWeight: 700,
                        background:
                          tx.type === "credit"
                            ? "rgba(76, 175, 80, 0.08)"
                            : "rgba(244, 67, 54, 0.08)",
                        color: tx.type === "credit" ? "#4CAF50" : "#F44336",
                        textTransform: "uppercase",
                      }}
                    >
                      {tx.type}
                    </span>
                  </td>
                  <td style={{ padding: "16px" }}>{tx.description}</td>
                  <td
                    style={{
                      padding: "16px",
                      fontWeight: 700,
                      color: tx.type === "credit" ? "#4CAF50" : "#F44336",
                    }}
                  >
                    {tx.type === "credit" ? "+" : ""}$
                    {Math.abs(parseFloat(tx.amount)).toFixed(2)}
                  </td>
                </tr>
              ))}

              {transactions.length === 0 && (
                <tr>
                  <td
                    colSpan={4}
                    style={{
                      padding: "40px",
                      textAlign: "center",
                      color: "var(--text-muted)",
                    }}
                  >
                    No wallet activity logged.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
