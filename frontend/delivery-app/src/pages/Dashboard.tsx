import React, { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
import {
  Truck,
  Check,
  Power,
  DollarSign,
  Navigation,
  ArrowUpRight as ArrowUpRightIcon,
  Clock,
  FileText,
  Wallet,
  ArrowDownLeft,
  TrendingUp,
  CheckCircle,
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
  delivery_charges?: string;
}

export const Dashboard: React.FC = () => {
  const [isOnline, setIsOnline] = useState(false);
  const [jobs, setJobs] = useState<Order[]>([]);
  const [activeJob, setActiveJob] = useState<Order | null>(null);
  const [activeJobDetails, setActiveJobDetails] = useState<any | null>(null);
  const [walletBalance, setWalletBalance] = useState(0);
  const [socket, setSocket] = useState<Socket | null>(null);

  // Payout and Transaction history states
  const [payoutAmount, setPayoutAmount] = useState("");
  const [payoutLoading, setPayoutLoading] = useState(false);
  const [transactions, setTransactions] = useState<any[]>([]);

  // Blinkit / Zomato custom delivery features
  const [deliveryStep, setDeliveryStep] = useState<
    "accepted" | "arrived_store" | "picked_up"
  >("accepted");
  const [activeOrderItems, setActiveOrderItems] = useState<any[]>([]);
  const [deliveryTimer, setDeliveryTimer] = useState(600); // 10 mins
  const [gpsProgress, setGpsProgress] = useState(0);


  const [completedDeliveriesCount, setCompletedDeliveriesCount] = useState(0);
  const [totalEarningAmt, setTotalEarningAmt] = useState(0);

  useEffect(() => {
    if (activeJob) {
      api
        .get(`/orders/${activeJob.id}`)
        .then((res) => {
          if (res.data.status === "success" && res.data.data) {
            setActiveOrderItems(res.data.data.items || []);
            setActiveJobDetails(res.data.data);
          }
        })
        .catch(console.error);
    } else {
      setActiveOrderItems([]);
      setActiveJobDetails(null);
    }
  }, [activeJob?.id]);

  useEffect(() => {
    if (activeJob) {
      const savedStep = localStorage.getItem(`delivery_step_${activeJob.id}`);
      if (savedStep) {
        setDeliveryStep(savedStep as any);
        if (savedStep === "picked_up" && socket) {
          socket.emit("joinRoom", { room: `order_${activeJob.id}` });
          simulateGPSMovement(activeJob.id);
        }
      } else {
        setDeliveryStep("accepted");
      }
    }
  }, [activeJob?.id, !!socket]);

  useEffect(() => {
    let interval: any;
    if (activeJob && deliveryStep === "picked_up") {
      interval = setInterval(() => {
        setDeliveryTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [activeJob, deliveryStep]);

  const formatTime = (seconds: number) => {
    const isNegative = seconds < 0;
    const absSeconds = Math.abs(seconds);
    const mins = Math.floor(absSeconds / 60);
    const secs = absSeconds % 60;
    return `${isNegative ? "-" : ""}${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const fetchDriverStats = async () => {
    try {
      const meRes = await api.get("/auth/me");
      let currentDriverId = "";
      if (meRes.data.status === "success" && meRes.data.data) {
        setIsOnline(!!meRes.data.data.is_online);
        currentDriverId = meRes.data.data.id;
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

        // Calculate statistics
        if (currentDriverId) {
          const completed = allOrders.filter(
            (o: any) =>
              o.status === "delivered" &&
              o.delivery_partner_id === currentDriverId,
          );
          setCompletedDeliveriesCount(completed.length);
          const totalEarnings = completed.reduce(
            (sum: number, o: any) =>
              sum + parseFloat(o.delivery_charges || "0"),
            0,
          );
          setTotalEarningAmt(totalEarnings);
        }
      }
    } catch (err) {
      console.error("Fetch driver stats failed:", err);
    }
  };

  useEffect(() => {
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
        await fetchDriverStats();
        setDeliveryStep("accepted");
        localStorage.setItem(`delivery_step_${orderId}`, "accepted");
        toast.success(
          "Logistics job accepted! Start heading to the restaurant.",
        );
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
        localStorage.removeItem(`delivery_step_${orderId}`);
        toast.success("Order delivered successfully!", {
          description: "Delivery earnings credited to your wallet.",
        });

        await fetchDriverStats();
      }
    } catch (err) {
      toast.error("Failed to complete delivery.");
    }
  };

  const handleQuickFill = (amount: number) => {
    if (amount <= walletBalance) {
      setPayoutAmount(amount.toString());
    } else {
      setPayoutAmount(walletBalance.toFixed(2));
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

        await fetchDriverStats();
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
    setGpsProgress(0);

    const interval = setInterval(() => {
      if (stepCount >= 10 || !activeJob) {
        clearInterval(interval);
        return;
      }

      lat += 0.0005;
      lon += 0.0005;
      stepCount++;
      setGpsProgress(stepCount * 10);

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
    <div className="app-shell">
      {/* Header Info */}
      <div className="dashboard-grid section-spacing">
        {/* Toggle block */}
        <div
          className="header-panel-premium"
          style={{ marginBottom: 0, width: "100%" }}
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
          className="panel-card panel-card-stacked"
          style={{
            minHeight: "220px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            background: "linear-gradient(135deg, #ffffff 0%, #fafcff 100%)",
          }}
        >
          <div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                marginBottom: "8px",
              }}
            >
              <Wallet size={16} color="var(--accent-orange)" />
              <span
                style={{
                  fontSize: "0.8rem",
                  fontWeight: 700,
                  color: "var(--text-muted)",
                  letterSpacing: "0.05em",
                }}
              >
                MY SETTLEMENT WALLET
              </span>
            </div>
            <div
              style={{ display: "flex", alignItems: "baseline", gap: "4px" }}
            >
              <span
                style={{
                  fontSize: "2.4rem",
                  fontWeight: 900,
                  color: "var(--text-slate)",
                }}
              >
                ₹{walletBalance.toFixed(2)}
              </span>
            </div>
            <span
              style={{
                fontSize: "0.8rem",
                color: "var(--text-muted)",
                display: "block",
                marginTop: "4px",
              }}
            >
              Withdrawable earnings balance
            </span>
          </div>

          <form
            onSubmit={handleRequestPayout}
            style={{
              marginTop: "16px",
              display: "flex",
              flexDirection: "column",
              gap: "10px",
            }}
          >
            <div style={{ display: "flex", gap: "8px" }}>
              <input
                type="number"
                step="0.01"
                value={payoutAmount}
                onChange={(e) => setPayoutAmount(e.target.value)}
                placeholder="Amount"
                required
                className="input-premium"
                style={{
                  flexGrow: 1,
                  padding: "10px 14px",
                  fontSize: "0.95rem",
                }}
              />
              <button
                type="submit"
                disabled={payoutLoading || walletBalance <= 0}
                className="btn-premium"
                style={{
                  padding: "10px 20px",
                  fontSize: "0.9rem",
                  background: "var(--primary-gradient)",
                  cursor:
                    payoutLoading || walletBalance <= 0
                      ? "not-allowed"
                      : "pointer",
                }}
              >
                {payoutLoading ? "Wait..." : "Cash Out"}
              </button>
            </div>
            {/* Quick cash out presets */}
            <div style={{ display: "flex", gap: "6px" }}>
              <button
                type="button"
                onClick={() => handleQuickFill(50)}
                style={{
                  background: "#FFF",
                  border: "1px solid var(--glass-border)",
                  borderRadius: "6px",
                  padding: "4px 8px",
                  fontSize: "0.75rem",
                  cursor: "pointer",
                  fontWeight: 600,
                }}
              >
                ₹50
              </button>
              <button
                type="button"
                onClick={() => handleQuickFill(100)}
                style={{
                  background: "#FFF",
                  border: "1px solid var(--glass-border)",
                  borderRadius: "6px",
                  padding: "4px 8px",
                  fontSize: "0.75rem",
                  cursor: "pointer",
                  fontWeight: 600,
                }}
              >
                ₹100
              </button>
              <button
                type="button"
                onClick={() => handleQuickFill(500)}
                style={{
                  background: "#FFF",
                  border: "1px solid var(--glass-border)",
                  borderRadius: "6px",
                  padding: "4px 8px",
                  fontSize: "0.75rem",
                  cursor: "pointer",
                  fontWeight: 600,
                }}
              >
                ₹500
              </button>
              <button
                type="button"
                onClick={() => handleQuickFill(walletBalance)}
                style={{
                  background: "rgba(255, 90, 31, 0.05)",
                  border: "1px solid var(--accent-orange)",
                  color: "var(--accent-orange)",
                  borderRadius: "6px",
                  padding: "4px 8px",
                  fontSize: "0.75rem",
                  cursor: "pointer",
                  fontWeight: 700,
                }}
              >
                Settlement Max
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Grid Stats matching restaurant app's Earnings.tsx */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
          gap: "24px",
          marginBottom: "40px",
        }}
      >
        {/* Gross Revenue / Total Earnings */}
        <div
          style={{
            background: "linear-gradient(135deg, #ffffff 0%, #fefcf9 100%)",
            border: "1px solid var(--glass-border)",
            borderRadius: "20px",
            padding: "28px",
            boxShadow: "0 10px 25px rgba(25, 25, 25, 0.02)",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "16px",
            }}
          >
            <span
              style={{
                color: "var(--text-muted)",
                fontSize: "0.85rem",
                fontWeight: 700,
                letterSpacing: "0.05em",
              }}
            >
              GROSS EARNINGS
            </span>
            <div
              style={{
                background: "rgba(255, 90, 31, 0.08)",
                padding: "8px",
                borderRadius: "12px",
              }}
            >
              <TrendingUp size={20} color="var(--accent-orange)" />
            </div>
          </div>
          <div
            style={{
              fontSize: "2.2rem",
              fontWeight: 800,
              color: "var(--text-slate)",
            }}
          >
            ₹{totalEarningAmt.toFixed(2)}
          </div>
          <div
            style={{
              fontSize: "0.85rem",
              color: "var(--text-muted)",
              marginTop: "8px",
            }}
          >
            Total delivery payouts earned
          </div>
        </div>

        {/* Current Settlement Balance */}
        <div
          style={{
            background: "linear-gradient(135deg, #ffffff 0%, #fafffa 100%)",
            border: "1px solid var(--glass-border)",
            borderRadius: "20px",
            padding: "28px",
            boxShadow: "0 10px 25px rgba(25, 25, 25, 0.02)",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "16px",
            }}
          >
            <span
              style={{
                color: "var(--text-muted)",
                fontSize: "0.85rem",
                fontWeight: 700,
                letterSpacing: "0.05em",
              }}
            >
              SETTLEMENT BALANCE
            </span>
            <div
              style={{
                background: "rgba(76, 175, 80, 0.08)",
                padding: "8px",
                borderRadius: "12px",
              }}
            >
              <CheckCircle size={20} color="#4CAF50" />
            </div>
          </div>
          <div
            style={{ fontSize: "2.2rem", fontWeight: 800, color: "#4CAF50" }}
          >
            ₹{walletBalance.toFixed(2)}
          </div>
          <div
            style={{
              fontSize: "0.85rem",
              color: "var(--text-muted)",
              marginTop: "8px",
            }}
          >
            Available in your driver wallet
          </div>
        </div>

        {/* Completed Deliveries */}
        <div
          style={{
            background: "linear-gradient(135deg, #ffffff 0%, #fafcff 100%)",
            border: "1px solid var(--glass-border)",
            borderRadius: "20px",
            padding: "28px",
            boxShadow: "0 10px 25px rgba(25, 25, 25, 0.02)",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "16px",
            }}
          >
            <span
              style={{
                color: "var(--text-muted)",
                fontSize: "0.85rem",
                fontWeight: 700,
                letterSpacing: "0.05em",
              }}
            >
              COMPLETED JOBS
            </span>
            <div
              style={{
                background: "rgba(138, 43, 226, 0.08)",
                padding: "8px",
                borderRadius: "12px",
              }}
            >
              <Truck size={20} color="var(--accent-violet)" />
            </div>
          </div>
          <div
            style={{
              fontSize: "2.2rem",
              fontWeight: 800,
              color: "var(--text-slate)",
            }}
          >
            {completedDeliveriesCount}
          </div>
          <div
            style={{
              fontSize: "0.85rem",
              color: "var(--text-muted)",
              marginTop: "8px",
            }}
          >
            Successfully delivered orders
          </div>
        </div>

        {/* Online Shift Status */}
        <div
          style={{
            background: "linear-gradient(135deg, #ffffff 0%, #fcfcfe 100%)",
            border: "1px solid var(--glass-border)",
            borderRadius: "20px",
            padding: "28px",
            boxShadow: "0 10px 25px rgba(25, 25, 25, 0.02)",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "16px",
            }}
          >
            <span
              style={{
                color: "var(--text-muted)",
                fontSize: "0.85rem",
                fontWeight: 700,
                letterSpacing: "0.05em",
              }}
            >
              SHIFT STATUS
            </span>
            <div
              style={{
                background: "rgba(0, 0, 0, 0.04)",
                padding: "8px",
                borderRadius: "12px",
              }}
            >
              <Power size={20} color="var(--text-slate)" />
            </div>
          </div>
          <div
            style={{
              fontSize: "2.2rem",
              fontWeight: 800,
              color: isOnline ? "#4CAF50" : "#F44336",
            }}
          >
            {isOnline ? "ONLINE" : "OFFLINE"}
          </div>
          <div
            style={{
              fontSize: "0.85rem",
              color: "var(--text-muted)",
              marginTop: "8px",
            }}
          >
            Toggle shifts using status button
          </div>
        </div>
      </div>

      {/* Active delivery job card */}
      {activeJob && (
        <div
          className="panel-card accent-panel"
          style={{
            marginBottom: "40px",
            borderLeft: "5px solid var(--accent-orange)",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              flexWrap: "wrap",
              gap: "20px",
            }}
          >
            <div style={{ flex: 1, minWidth: "280px" }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  marginBottom: "12px",
                  flexWrap: "wrap",
                }}
              >
                <span
                  className="status-pill warning"
                  style={{
                    textTransform: "uppercase",
                    letterSpacing: "1px",
                    fontWeight: 800,
                  }}
                >
                  Active Job: {deliveryStep.replace("_", " ")}
                </span>
                <span
                  style={{
                    fontSize: "0.95rem",
                    fontWeight: 700,
                    color: "var(--accent-orange)",
                    background: "rgba(255, 90, 31, 0.08)",
                    padding: "4px 10px",
                    borderRadius: "100px",
                  }}
                >
                  Payout: ₹
                  {parseFloat(activeJob.delivery_charges || "0").toFixed(2)}
                </span>
                {deliveryStep === "picked_up" && (
                  <span
                    style={{
                      fontSize: "1.1rem",
                      fontWeight: 800,
                      color:
                        deliveryTimer < 60 ? "#F44336" : "var(--accent-orange)",
                      fontFamily: "monospace",
                    }}
                  >
                    ⏱️ Deliver in: {formatTime(deliveryTimer)} (GPS Progress:{" "}
                    {gpsProgress}%)
                  </span>
                )}
              </div>

              <strong style={{ fontSize: "1.5rem" }}>
                Order #{activeJob.order_number}
              </strong>
              <div
                style={{
                  color: "var(--text-slate)",
                  fontSize: "1rem",
                  marginTop: "8px",
                }}
              >
                Pickup Store: <strong>{activeJob.restaurant_name}</strong>
              </div>

              {/* Detailed Bill and Customer Info */}
              {activeJobDetails ? (
                <div
                  style={{
                    marginTop: "16px",
                    display: "flex",
                    flexDirection: "column",
                    gap: "12px",
                    borderTop: "1px solid var(--glass-border)",
                    paddingTop: "16px",
                  }}
                >
                  <div>
                    <span
                      style={{
                        fontSize: "0.85rem",
                        fontWeight: 700,
                        color: "var(--text-muted)",
                        display: "block",
                      }}
                    >
                      CUSTOMER DETAILS
                    </span>
                    <strong>
                      {activeJobDetails.customer_first_name}{" "}
                      {activeJobDetails.customer_last_name}
                    </strong>{" "}
                    ({activeJobDetails.customer_phone})
                  </div>
                  <div>
                    <span
                      style={{
                        fontSize: "0.85rem",
                        fontWeight: 700,
                        color: "var(--text-muted)",
                        display: "block",
                      }}
                    >
                      DELIVERY ADDRESS
                    </span>
                    <strong>{activeJobDetails.street_address}</strong>
                    {activeJobDetails.landmark && (
                      <span
                        style={{
                          display: "block",
                          fontSize: "0.9rem",
                          color: "var(--text-muted)",
                          fontStyle: "italic",
                        }}
                      >
                        Landmark: {activeJobDetails.landmark}
                      </span>
                    )}
                    <span style={{ display: "block", fontSize: "0.9rem" }}>
                      {activeJobDetails.city}, {activeJobDetails.state} -{" "}
                      {activeJobDetails.postal_code}
                    </span>
                  </div>
                  {activeJobDetails.notes && (
                    <div>
                      <span
                        style={{
                          fontSize: "0.85rem",
                          fontWeight: 700,
                          color: "var(--text-muted)",
                          display: "block",
                        }}
                      >
                        DELIVERY INSTRUCTIONS / NOTES
                      </span>
                      <p
                        style={{
                          margin: "4px 0 0 0",
                          fontSize: "0.9rem",
                          fontStyle: "italic",
                          color: "var(--accent-orange)",
                        }}
                      >
                        "{activeJobDetails.notes}"
                      </p>
                    </div>
                  )}

                  <div
                    style={{
                      background: "rgba(25, 25, 25, 0.03)",
                      padding: "16px",
                      borderRadius: "12px",
                      border: "1px solid var(--glass-border)",
                      maxWidth: "400px",
                    }}
                  >
                    <div
                      style={{
                        fontSize: "0.85rem",
                        fontWeight: 700,
                        color: "var(--text-muted)",
                        marginBottom: "10px",
                      }}
                    >
                      BILL DETAIL SUMMARY
                    </div>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        fontSize: "0.9rem",
                        marginBottom: "6px",
                      }}
                    >
                      <span>Items Total:</span>
                      <span>
                        ₹{parseFloat(activeJobDetails.item_total).toFixed(2)}
                      </span>
                    </div>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        fontSize: "0.9rem",
                        marginBottom: "6px",
                      }}
                    >
                      <span>Delivery Fee:</span>
                      <span>
                        ₹
                        {parseFloat(activeJobDetails.delivery_charges).toFixed(
                          2,
                        )}
                      </span>
                    </div>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        fontSize: "0.9rem",
                        marginBottom: "6px",
                      }}
                    >
                      <span>Taxes & Charges:</span>
                      <span>
                        ₹{parseFloat(activeJobDetails.tax_amount).toFixed(2)}
                      </span>
                    </div>
                    {parseFloat(activeJobDetails.discount_amount) > 0 && (
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          fontSize: "0.9rem",
                          color: "#4CAF50",
                          marginBottom: "6px",
                        }}
                      >
                        <span>Discount ({activeJobDetails.coupon_code}):</span>
                        <span>
                          -₹
                          {parseFloat(activeJobDetails.discount_amount).toFixed(
                            2,
                          )}
                        </span>
                      </div>
                    )}
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        fontSize: "1rem",
                        fontWeight: 800,
                        borderTop: "1px dashed var(--glass-border)",
                        paddingTop: "8px",
                        marginTop: "8px",
                      }}
                    >
                      <span>Total Payable:</span>
                      <span style={{ color: "var(--accent-orange)" }}>
                        ₹{parseFloat(activeJobDetails.total_payable).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <div
                  style={{
                    color: "var(--text-slate)",
                    fontSize: "1rem",
                    marginTop: "4px",
                  }}
                >
                  Deliver Address:{" "}
                  <strong>
                    {activeJob.street_address}, {activeJob.city}
                  </strong>
                </div>
              )}

              {/* Order items checklist when arrived at store */}
              {deliveryStep === "arrived_store" && (
                <div
                  style={{
                    marginTop: "16px",
                    background: "rgba(0,0,0,0.02)",
                    padding: "16px",
                    borderRadius: "8px",
                    border: "1px dashed var(--glass-border)",
                    maxWidth: "500px",
                  }}
                >
                  <h4
                    style={{
                      margin: "0 0 10px 0",
                      fontSize: "0.95rem",
                      textTransform: "uppercase",
                      letterSpacing: "0.5px",
                    }}
                  >
                    Verify Store Order Items:
                  </h4>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "8px",
                    }}
                  >
                    {activeOrderItems.map((item, idx) => (
                      <label
                        key={idx}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                          cursor: "pointer",
                          fontSize: "0.9rem",
                        }}
                      >
                        <input
                          type="checkbox"
                          defaultChecked={false}
                          style={{ width: "16px", height: "16px" }}
                        />
                        <span>
                          <strong>{item.quantity}x</strong> {item.item_name}
                        </span>
                      </label>
                    ))}
                    {activeOrderItems.length === 0 && (
                      <span
                        style={{
                          color: "var(--text-muted)",
                          fontSize: "0.85rem",
                        }}
                      >
                        Loading items...
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Steps & Controls */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-end",
                gap: "16px",
              }}
            >
              {deliveryStep === "accepted" && (
                <button
                  onClick={() => {
                    setDeliveryStep("arrived_store");
                    if (activeJob) {
                      localStorage.setItem(
                        `delivery_step_${activeJob.id}`,
                        "arrived_store",
                      );
                    }
                  }}
                  className="btn-premium"
                  style={{
                    background: "var(--primary-gradient)",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                  }}
                >
                  <Navigation size={18} /> I have Arrived at Store
                </button>
              )}

              {deliveryStep === "arrived_store" && (
                <button
                  onClick={() => {
                    setDeliveryStep("picked_up");
                    setDeliveryTimer(600); // 10 minutes
                    if (activeJob) {
                      localStorage.setItem(
                        `delivery_step_${activeJob.id}`,
                        "picked_up",
                      );
                    }
                    if (socket) {
                      socket.emit("joinRoom", {
                        room: `order_${activeJob.id}`,
                      });
                      simulateGPSMovement(activeJob.id);
                    }
                  }}
                  className="btn-premium"
                  style={{
                    background: "var(--accent-orange)",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                  }}
                >
                  <Check size={18} /> Order Picked Up (Start GPS)
                </button>
              )}

              {deliveryStep === "picked_up" && (
                <button
                  onClick={() => {
                    handleDeliverJob(activeJob.id);
                    setDeliveryStep("accepted");
                    localStorage.removeItem(`delivery_step_${activeJob.id}`);
                  }}
                  className="btn-premium"
                  style={{
                    background: "var(--accent-violet)",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                  }}
                >
                  <Check size={18} /> Mark Order Delivered
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Dispatch Board Feed */}
      <h2 style={{ fontSize: "1.6rem", marginBottom: "24px" }}>
        Logistics Dispatch Feed
      </h2>

      <div className="panel-grid section-spacing">
        {jobs.map((job) => (
          <div key={job.id} className="panel-card panel-card-stacked">
            <div className="panel-row">
              <strong>Order #{job.order_number}</strong>
              <span className="status-pill warning">Pending Pickup</span>
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
              <div
                style={{
                  marginTop: "4px",
                  color: "var(--accent-orange)",
                  fontWeight: 700,
                }}
              >
                Payout: ₹{parseFloat(job.delivery_charges || "0").toFixed(2)}
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
        className="panel-card"
        style={{
          background: "#FFF",
          borderRadius: "24px",
          padding: "32px",
          boxShadow: "0 10px 30px rgba(25, 25, 25, 0.02)",
        }}
      >
        <h3
          style={{
            fontSize: "1.3rem",
            fontWeight: 800,
            marginBottom: "24px",
            display: "flex",
            alignItems: "center",
            gap: "10px",
          }}
        >
          <FileText size={20} color="var(--accent-violet)" /> Wallet Transaction
          History Ledger
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
                  borderBottom: "2px solid var(--glass-border)",
                  color: "var(--text-muted)",
                  fontSize: "0.85rem",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                }}
              >
                <th style={{ padding: "14px 16px" }}>DATE & TIME</th>
                <th style={{ padding: "14px 16px" }}>TRANSACTION DETAILS</th>
                <th style={{ padding: "14px 16px" }}>REFERENCE TYPE</th>
                <th style={{ padding: "14px 16px" }}>PAYMENT TYPE</th>
                <th style={{ padding: "14px 16px" }}>AMOUNT</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((tx: any) => (
                <tr
                  key={tx.id}
                  style={{
                    borderBottom: "1px solid #f2efeb",
                    fontSize: "0.95rem",
                    transition: "background 0.2s",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "#fafaf9";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "transparent";
                  }}
                >
                  <td style={{ padding: "18px 16px" }}>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                      }}
                    >
                      <Clock size={16} color="var(--text-muted)" />
                      <span>{new Date(tx.created_at).toLocaleString()}</span>
                    </div>
                  </td>
                  <td style={{ padding: "18px 16px" }}>
                    <div
                      style={{ fontWeight: 700, color: "var(--text-slate)" }}
                    >
                      {tx.description}
                    </div>
                    <div
                      style={{
                        fontSize: "0.8rem",
                        color: "var(--text-muted)",
                        fontFamily: "monospace",
                        marginTop: "4px",
                      }}
                    >
                      ID: {tx.id}
                    </div>
                  </td>
                  <td style={{ padding: "18px 16px" }}>
                    <span
                      style={{
                        fontSize: "0.75rem",
                        fontWeight: 800,
                        textTransform: "uppercase",
                        padding: "4px 10px",
                        borderRadius: "100px",
                        background:
                          tx.reference_type === "refund"
                            ? "rgba(244, 67, 54, 0.08)"
                            : "rgba(25, 25, 25, 0.05)",
                        color:
                          tx.reference_type === "refund"
                            ? "#F44336"
                            : "var(--text-slate)",
                      }}
                    >
                      {tx.reference_type.replace("_", " ")}
                    </span>
                  </td>
                  <td style={{ padding: "18px 16px" }}>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                      }}
                    >
                      {tx.type === "credit" ? (
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "4px",
                            color: "#4CAF50",
                            fontWeight: 700,
                            fontSize: "0.85rem",
                          }}
                        >
                          <ArrowDownLeft size={16} />
                          <span>Credit</span>
                        </div>
                      ) : (
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "4px",
                            color: "#F44336",
                            fontWeight: 700,
                            fontSize: "0.85rem",
                          }}
                        >
                          <ArrowUpRightIcon size={16} />
                          <span>Settlement</span>
                        </div>
                      )}
                    </div>
                  </td>
                  <td
                    style={{
                      padding: "18px 16px",
                      color: tx.type === "credit" ? "#4CAF50" : "#F44336",
                      fontWeight: 800,
                      fontSize: "1.1rem",
                    }}
                  >
                    {tx.type === "credit" ? "+" : "-"}₹
                    {Math.abs(parseFloat(tx.amount)).toFixed(2)}
                  </td>
                </tr>
              ))}

              {transactions.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    style={{
                      padding: "50px",
                      textAlign: "center",
                      color: "var(--text-muted)",
                      fontSize: "1rem",
                    }}
                  >
                    No wallet activity or payout logs found.
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
