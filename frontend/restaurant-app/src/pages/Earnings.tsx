import React, { useEffect, useState } from "react";
import {
  DollarSign,
  FileText,
  ArrowUpRight,
  TrendingUp,
  Wallet,
  Building,
  CheckCircle,
  Clock,
  ArrowDownLeft,
  ArrowUpRight as ArrowUpRightIcon,
} from "lucide-react";
import notify from "../../../shared/utils/toast";
import api from "../../../shared/services/api";
import { LoadingSpinner } from "../../../shared/components/LoadingSpinner";
import { StatCard } from "../../../shared/components/StatCard";

interface Summary {
  total_orders: number;
  gross_sales: string | number;
  total_commissions: string | number;
  net_earnings: string | number;
}

interface EarningRow {
  id: string;
  order_id: string;
  order_total: string | number;
  commission_amount: string | number;
  net_earning: string | number;
  created_at: string;
}

interface TransactionRow {
  id: string;
  amount: string;
  type: "credit" | "debit";
  description: string;
  reference_type: string;
  created_at: string;
}

export const Earnings: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [ledger, setLedger] = useState<EarningRow[]>([]);
  const [walletBalance, setWalletBalance] = useState(0);
  const [payoutAmount, setPayoutAmount] = useState("");
  const [payoutLoading, setPayoutLoading] = useState(false);
  const [walletTransactions, setWalletTransactions] = useState<
    TransactionRow[]
  >([]);

  const fetchEarningsAndWallet = async () => {
    try {
      const meRes = await api.get("/auth/me");
      const myRestaurant = meRes.data.data?.restaurant;

      if (myRestaurant) {
        const reportRes = await api.get(
          `/reports/restaurant/${myRestaurant.id}`,
        );
        if (reportRes.data.status === "success") {
          setSummary(reportRes.data.data.summary);
          setLedger(reportRes.data.data.ledger || []);
        }
      }

      // Fetch wallet balance and transactions
      const walletRes = await api.get("/wallets");
      if (walletRes.data.status === "success" && walletRes.data.data) {
        setWalletBalance(parseFloat(walletRes.data.data.balance || "0"));
        setWalletTransactions(walletRes.data.data.transactions || []);
      }
    } catch (err) {
      console.error("Failed to load financial details:", err);
      notify.error("We couldn't load your financial details.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEarningsAndWallet();
  }, []);

  const handlePayoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(payoutAmount);
    if (isNaN(amt) || amt <= 0) {
      notify.warning("Please enter a valid payout amount.");
      return;
    }
    if (amt > walletBalance) {
      notify.warning("You don't have enough funds for this withdrawal.");
      return;
    }

    setPayoutLoading(true);
    try {
      const response = await api.post("/wallets/payout", { amount: amt });
      if (response.data.status === "success") {
        notify.success("Payout requested successfully!");
        setPayoutAmount("");
        await fetchEarningsAndWallet();
      }
    } catch (err: any) {
      notify.error(
        err.response?.data?.message || "We couldn't process this payout.",
      );
    } finally {
      setPayoutLoading(false);
    }
  };

  const handleQuickFill = (amount: number) => {
    if (amount <= walletBalance) {
      setPayoutAmount(amount.toString());
    } else {
      setPayoutAmount(walletBalance.toFixed(2));
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
        <p style={{ color: "var(--text-muted)", fontSize: "1.1rem" }}>
          Loading financial dashboard...
        </p>
      </div>
    );
  }

  return (
    <div style={{ padding: "40px", maxWidth: "1250px", margin: "0 auto" }}>
      {/* Top Banner / Heading */}
      <div
        style={{
          marginBottom: "40px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "20px",
        }}
      >
        <div>
          <h1
            style={{
              fontSize: "2.4rem",
              fontWeight: 800,
              marginBottom: "8px",
              background: "var(--primary-gradient)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Merchant Partner Finances
          </h1>
          <p style={{ color: "var(--text-muted)", fontSize: "1rem" }}>
            Manage payouts, track sales revenues, and review platform ledger
            records.
          </p>
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            background: "var(--glass-bg)",
            border: "1px solid var(--glass-border)",
            padding: "10px 18px",
            borderRadius: "50px",
            fontSize: "0.9rem",
            fontWeight: 700,
          }}
        >
          <Building size={16} color="var(--accent-orange)" />
          <span>Active Restaurant Account</span>
          <span
            style={{
              width: "8px",
              height: "8px",
              borderRadius: "50%",
              background: "#4CAF50",
            }}
          ></span>
        </div>
      </div>

      {/* Grid Stats & Payout Panel */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr",
          gap: "32px",
          marginBottom: "40px",
        }}
      >
        {/* Main Financial Cards Row */}
        <div className="stat-grid">
          <StatCard
            theme="restaurant"
            title="GROSS REVENUE"
            icon={<TrendingUp size={20} color="var(--accent-orange)" />}
            value={`₹${parseFloat(summary?.gross_sales?.toString() || "0").toFixed(2)}`}
            subtitle="Before commissions & deductions"
            restContainerVariant="warm"
            restIconVariant="orange"
          />

          <StatCard
            theme="restaurant"
            title="PLATFORM COMMISSIONS"
            icon={<DollarSign size={20} color="var(--accent-violet)" />}
            value={`₹${parseFloat(summary?.total_commissions?.toString() || "0").toFixed(2)}`}
            subtitle="Deducted at source (avg 10%)"
            restContainerVariant="cool"
            restIconVariant="violet"
            restSubtitleVariant="danger"
          />

          <StatCard
            theme="restaurant"
            title="NET EARNINGS"
            icon={<CheckCircle size={20} color="#4CAF50" />}
            value={`₹${parseFloat(summary?.net_earnings?.toString() || "0").toFixed(2)}`}
            subtitle="Credited directly to owner wallet"
            restContainerVariant="green"
            restIconVariant="green"
            restValueVariant="green"
          />

          <StatCard
            theme="restaurant"
            title="TOTAL ORDERS"
            icon={<FileText size={20} color="var(--text-slate)" />}
            value={summary?.total_orders || 0}
            subtitle="Completed deliveries"
            restContainerVariant="default"
            restIconVariant="muted"
          />
        </div>

        {/* Payout & Wallet Interactive Portal */}
        <div
          style={{
            background: "var(--glass-bg)",
            border: "1px solid var(--glass-border)",
            borderRadius: "24px",
            padding: "32px",
            boxShadow: "0 15px 45px rgba(25, 25, 25, 0.04)",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
            gap: "32px",
          }}
        >
          {/* Wallet Balance Display */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                marginBottom: "12px",
              }}
            >
              <Wallet size={22} color="var(--accent-orange)" />
              <span
                style={{
                  fontSize: "1.05rem",
                  fontWeight: 700,
                  color: "var(--text-slate)",
                }}
              >
                Withdrawable Cash Balance
              </span>
            </div>
            <div
              style={{
                fontSize: "3rem",
                fontWeight: 900,
                color: "var(--text-slate)",
                display: "flex",
                alignItems: "center",
                gap: "4px",
              }}
            >
              ₹{walletBalance.toFixed(2)}
            </div>
            <p
              style={{
                color: "var(--text-muted)",
                fontSize: "0.9rem",
                marginTop: "10px",
                lineHeight: "1.5",
              }}
            >
              This balance is instantly available for withdrawal to your linked
              settlement account. Platform settlements are processed instantly.
            </p>
          </div>

          {/* Instant Cash Out Form */}
          <div
            style={{
              background: "#faf9f7",
              padding: "24px",
              borderRadius: "18px",
              border: "1px solid var(--glass-border)",
            }}
          >
            <h3
              style={{
                fontSize: "1.1rem",
                fontWeight: 800,
                marginBottom: "16px",
              }}
            >
              Instant Settlement Payout
            </h3>
            <form
              onSubmit={handlePayoutSubmit}
              style={{ display: "flex", flexDirection: "column", gap: "16px" }}
            >
              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: "0.8rem",
                    fontWeight: 700,
                    color: "var(--text-muted)",
                    marginBottom: "8px",
                  }}
                >
                  SETTLEMENT AMOUNT (INR)
                </label>
                <div style={{ position: "relative" }}>
                  <span
                    style={{
                      position: "absolute",
                      left: "16px",
                      top: "50%",
                      transform: "translateY(-50%)",
                      fontWeight: 700,
                      color: "var(--text-slate)",
                    }}
                  >
                    ₹
                  </span>
                  <input
                    type="number"
                    step="0.01"
                    value={payoutAmount}
                    onChange={(e) => setPayoutAmount(e.target.value)}
                    placeholder="0.00"
                    required
                    style={{
                      width: "100%",
                      padding: "12px 12px 12px 32px",
                      borderRadius: "10px",
                      border: "1px solid var(--glass-border)",
                      fontSize: "1.1rem",
                      fontWeight: 700,
                      outline: "none",
                    }}
                  />
                </div>
              </div>

              {/* Quick Fill Buttons */}
              <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                <button
                  type="button"
                  onClick={() => handleQuickFill(500)}
                  style={{
                    background: "var(--glass-bg)",
                    border: "1px solid var(--glass-border)",
                    borderRadius: "8px",
                    padding: "6px 12px",
                    fontSize: "0.8rem",
                    cursor: "pointer",
                    fontWeight: 600,
                  }}
                >
                  ₹500
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickFill(1000)}
                  style={{
                    background: "var(--glass-bg)",
                    border: "1px solid var(--glass-border)",
                    borderRadius: "8px",
                    padding: "6px 12px",
                    fontSize: "0.8rem",
                    cursor: "pointer",
                    fontWeight: 600,
                  }}
                >
                  ₹1000
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickFill(5000)}
                  style={{
                    background: "var(--glass-bg)",
                    border: "1px solid var(--glass-border)",
                    borderRadius: "8px",
                    padding: "6px 12px",
                    fontSize: "0.8rem",
                    cursor: "pointer",
                    fontWeight: 600,
                  }}
                >
                  ₹5000
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickFill(walletBalance)}
                  style={{
                    background: "rgba(255, 90, 31, 0.06)",
                    border: "1px solid var(--accent-orange)",
                    color: "var(--accent-orange)",
                    borderRadius: "8px",
                    padding: "6px 12px",
                    fontSize: "0.8rem",
                    cursor: "pointer",
                    fontWeight: 700,
                  }}
                >
                  Settlement Max
                </button>
              </div>

              <button
                type="submit"
                disabled={payoutLoading || walletBalance <= 0}
                style={{
                  width: "100%",
                  padding: "14px",
                  background: "var(--primary-gradient)",
                  color: "#FFF",
                  border: "none",
                  borderRadius: "10px",
                  fontSize: "1rem",
                  fontWeight: 800,
                  cursor:
                    payoutLoading || walletBalance <= 0
                      ? "not-allowed"
                      : "pointer",
                  opacity: payoutLoading || walletBalance <= 0 ? 0.6 : 1,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                  transition: "opacity 0.2s",
                }}
              >
                <ArrowUpRight size={18} />
                {payoutLoading
                  ? "Processing Transfer..."
                  : "Request Cash Settlement"}
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Ledger & Transactions Display Tabs */}
      <div
        style={{
          background: "var(--glass-bg)",
          border: "1px solid var(--glass-border)",
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
              {walletTransactions.map((row) => (
                <tr
                  key={row.id}
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
                  {/* Timestamp */}
                  <td
                    style={{ padding: "18px 16px", color: "var(--text-slate)" }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                      }}
                    >
                      <Clock size={16} color="var(--text-muted)" />
                      <span>{new Date(row.created_at).toLocaleString()}</span>
                    </div>
                  </td>

                  {/* Transaction Details / Description */}
                  <td style={{ padding: "18px 16px" }}>
                    <div
                      style={{ fontWeight: 700, color: "var(--text-slate)" }}
                    >
                      {row.description}
                    </div>
                    <div
                      style={{
                        fontSize: "0.8rem",
                        color: "var(--text-muted)",
                        fontFamily: "monospace",
                        marginTop: "4px",
                      }}
                    >
                      ID: {row.id}
                    </div>
                  </td>

                  {/* Reference Type Badge */}
                  <td style={{ padding: "18px 16px" }}>
                    <span
                      style={{
                        fontSize: "0.75rem",
                        fontWeight: 800,
                        textTransform: "uppercase",
                        padding: "4px 10px",
                        borderRadius: "100px",
                        background:
                          row.reference_type === "refund"
                            ? "rgba(244, 67, 54, 0.08)"
                            : "rgba(25, 25, 25, 0.05)",
                        color:
                          row.reference_type === "refund"
                            ? "#F44336"
                            : "var(--text-slate)",
                      }}
                    >
                      {row.reference_type.replace("_", " ")}
                    </span>
                  </td>

                  {/* Payment Type Badge */}
                  <td style={{ padding: "18px 16px" }}>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                      }}
                    >
                      {row.type === "credit" ? (
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

                  {/* Amount */}
                  <td
                    style={{
                      padding: "18px 16px",
                      color: row.type === "credit" ? "#4CAF50" : "#F44336",
                      fontWeight: 800,
                      fontSize: "1.1rem",
                    }}
                  >
                    {row.type === "credit" ? "+" : "-"}₹
                    {Math.abs(parseFloat(row.amount)).toFixed(2)}
                  </td>
                </tr>
              ))}

              {walletTransactions.length === 0 && (
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
