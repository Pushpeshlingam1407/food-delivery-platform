import React, { useEffect, useState } from "react";
import { CreditCard, ShieldAlert, Award, FileText } from "lucide-react";
import notify from "../../../shared/utils/toast";
import api from "../../../shared/services/api";

interface Order {
  id: string;
  order_number: string;
  restaurant_name: string;
  status: string;
  total_payable: number;
  placed_at: string;
}

export const Refunds: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<Order[]>([]);
  const [refundOrderId, setRefundOrderId] = useState<string | null>(null);
  const [refundReason, setRefundReason] = useState("");
  const [processing, setProcessing] = useState(false);

  const fetchOrders = async () => {
    try {
      const response = await api.get("/orders");
      if (response.data.status === "success") {
        setOrders(response.data.data || []);
      }
    } catch (err) {
      console.error(err);
      notify.error("Couldn't load platform orders.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleProcessRefund = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!refundOrderId || !refundReason) return;

    setProcessing(true);
    try {
      const response = await api.post("/admin/refunds", {
        orderId: refundOrderId,
        reason: refundReason,
      });

      if (response.data.status === "success") {
        notify.success("Refund processed to customer wallet.");
        setRefundOrderId(null);
        setRefundReason("");
        fetchOrders();
      }
    } catch (err: any) {
      notify.error(
        err.response?.data?.message || "Couldn't process the refund.",
      );
    } finally {
      setProcessing(false);
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
        <p style={{ color: "var(--text-muted)" }}>Loading orders ledger...</p>
      </div>
    );
  }

  return (
    <div style={{ padding: "40px", maxWidth: "1200px", margin: "0 auto" }}>
      {/* Header */}
      <div style={{ marginBottom: "40px" }}>
        <h1
          style={{
            fontSize: "2.2rem",
            marginBottom: "8px",
            fontFamily: "var(--font-anthropic)",
          }}
        >
          Refunds Control Center
        </h1>
        <p style={{ color: "var(--text-muted)" }}>
          Search transactions, approve wallet refunds, and resolve client
          disputes.
        </p>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 400px",
          gap: "40px",
        }}
      >
        {/* Orders Table */}
        <div
          style={{
            background: "var(--glass-bg)",
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
            <FileText size={18} color="var(--accent-violet)" /> Platform Orders
            Ledger
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
                  <th style={{ padding: "12px 16px" }}>ORDER #</th>
                  <th style={{ padding: "12px 16px" }}>RESTAURANT</th>
                  <th style={{ padding: "12px 16px" }}>STATUS</th>
                  <th style={{ padding: "12px 16px" }}>TOTAL</th>
                  <th style={{ padding: "12px 16px" }}>ACTION</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((o) => (
                  <tr
                    key={o.id}
                    style={{
                      borderBottom: "1px solid var(--glass-border)",
                      fontSize: "0.95rem",
                    }}
                  >
                    <td style={{ padding: "16px", fontWeight: 600 }}>
                      #{o.order_number}
                      <div
                        style={{
                          fontSize: "0.72rem",
                          color: "var(--text-muted)",
                          fontWeight: 400,
                          marginTop: "2px",
                        }}
                      >
                        ID: {o.id}
                      </div>
                    </td>
                    <td style={{ padding: "16px" }}>{o.restaurant_name}</td>
                    <td style={{ padding: "16px" }}>
                      <span
                        style={{
                          padding: "3px 8px",
                          borderRadius: "100px",
                          fontSize: "0.75rem",
                          fontWeight: 700,
                          background:
                            o.status === "delivered"
                              ? "rgba(76, 175, 80, 0.08)"
                              : "rgba(25, 25, 25, 0.04)",
                          color:
                            o.status === "delivered"
                              ? "#4CAF50"
                              : "var(--text-slate)",
                        }}
                      >
                        {o.status.toUpperCase()}
                      </span>
                    </td>
                    <td style={{ padding: "16px", fontWeight: 700 }}>
                      $
                      {parseFloat((o.total_payable || 0).toString()).toFixed(2)}
                    </td>
                    <td style={{ padding: "16px" }}>
                      {o.status === "delivered" && (
                        <button
                          onClick={() => setRefundOrderId(o.id)}
                          className="btn-premium"
                          style={{
                            padding: "6px 12px",
                            fontSize: "0.75rem",
                            background: "red",
                            boxShadow: "none",
                          }}
                        >
                          Initiate Refund
                        </button>
                      )}
                    </td>
                  </tr>
                ))}

                {orders.length === 0 && (
                  <tr>
                    <td
                      colSpan={5}
                      style={{
                        padding: "40px",
                        textAlign: "center",
                        color: "var(--text-muted)",
                      }}
                    >
                      No orders registered on the platform.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Refund Form side block */}
        <div>
          {refundOrderId ? (
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
                <ShieldAlert size={18} color="red" /> Refund Transaction
              </h3>

              <form
                onSubmit={handleProcessRefund}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "16px",
                }}
              >
                <div style={{ fontSize: "0.9rem", color: "var(--text-slate)" }}>
                  You are issuing a wallet refund for Order ID:
                  <div
                    style={{
                      fontFamily: "monospace",
                      padding: "8px",
                      background: "rgba(25, 25, 25, 0.04)",
                      borderRadius: "4px",
                      marginTop: "6px",
                      fontSize: "0.8rem",
                      wordBreak: "break-all",
                    }}
                  >
                    {refundOrderId}
                  </div>
                </div>

                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "6px",
                  }}
                >
                  <label style={{ fontSize: "0.8rem", fontWeight: 700 }}>
                    REFUND REASON *
                  </label>
                  <textarea
                    placeholder="Enter explicit reason for audit log..."
                    value={refundReason}
                    onChange={(e) => setRefundReason(e.target.value)}
                    required
                    style={{
                      padding: "12px",
                      borderRadius: "6px",
                      border: "1px solid var(--glass-border)",
                      minHeight: "100px",
                      outline: "none",
                    }}
                  />
                </div>

                <div style={{ display: "flex", gap: "12px" }}>
                  <button
                    type="submit"
                    disabled={processing}
                    className="btn-premium"
                    style={{
                      flex: 1,
                      padding: "10px",
                      fontSize: "0.9rem",
                      background: "red",
                    }}
                  >
                    {processing ? "Refunding..." : "Confirm Refund"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setRefundOrderId(null)}
                    style={{
                      background: "none",
                      border: "none",
                      color: "var(--text-muted)",
                      cursor: "pointer",
                      fontSize: "0.9rem",
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <div
              style={{
                background: "var(--glass-bg)",
                border: "1px solid var(--glass-border)",
                borderRadius: "var(--radius-squircle)",
                padding: "32px",
                textAlign: "center",
                color: "var(--text-muted)",
              }}
            >
              Select a completed order from the ledger to initiate a client
              refund.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
