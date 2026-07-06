import React, { useEffect, useState } from "react";
import { DollarSign, FileText, ArrowUpRight, TrendingUp } from "lucide-react";
import { toast } from "sonner";
import api from "../../../shared/services/api";

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

export const Earnings: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [ledger, setLedger] = useState<EarningRow[]>([]);

  useEffect(() => {
    const fetchEarningsReport = async () => {
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
      } catch (err) {
        console.error("Failed to load earnings report:", err);
        toast.error("Failed to load earnings report.");
      } finally {
        setLoading(false);
      }
    };

    fetchEarningsReport();
  }, []);

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
        <p style={{ color: "var(--text-muted)" }}>Loading earnings report...</p>
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
          Financial Summary
        </h1>
        <p style={{ color: "var(--text-muted)" }}>
          Monitor your store revenues, net earnings, and commissions paid.
        </p>
      </div>

      {/* Grid Stats */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
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
              fontSize: "0.85rem",
              fontWeight: 700,
              marginBottom: "8px",
            }}
          >
            GROSS SALES
          </div>
          <div
            style={{
              fontSize: "1.8rem",
              fontWeight: 800,
              display: "flex",
              alignItems: "center",
              gap: "4px",
            }}
          >
            <DollarSign size={24} color="var(--accent-orange)" />
            {parseFloat(summary?.gross_sales?.toString() || "0").toFixed(2)}
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
              fontSize: "0.85rem",
              fontWeight: 700,
              marginBottom: "8px",
            }}
          >
            PLATFORM COMMISSIONS
          </div>
          <div
            style={{
              fontSize: "1.8rem",
              fontWeight: 800,
              display: "flex",
              alignItems: "center",
              gap: "4px",
            }}
          >
            <DollarSign size={24} color="var(--accent-violet)" />
            {parseFloat(summary?.total_commissions?.toString() || "0").toFixed(
              2,
            )}
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
              fontSize: "0.85rem",
              fontWeight: 700,
              marginBottom: "8px",
            }}
          >
            NET EARNINGS
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
            {parseFloat(summary?.net_earnings?.toString() || "0").toFixed(2)}
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
              fontSize: "0.85rem",
              fontWeight: 700,
              marginBottom: "8px",
            }}
          >
            TOTAL ORDERS
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
            <TrendingUp size={24} color="var(--accent-orange)" />
            {summary?.total_orders || 0}
          </div>
        </div>
      </div>

      {/* Ledger Table */}
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
          <FileText size={18} color="var(--accent-violet)" /> Earnings
          Transactions Ledger
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
                <th style={{ padding: "12px 16px" }}>ORDER ID</th>
                <th style={{ padding: "12px 16px" }}>ORDER TOTAL</th>
                <th style={{ padding: "12px 16px" }}>COMMISSION</th>
                <th style={{ padding: "12px 16px" }}>NET PAYOUT</th>
              </tr>
            </thead>
            <tbody>
              {ledger.map((row) => (
                <tr
                  key={row.id}
                  style={{
                    borderBottom: "1px solid var(--glass-border)",
                    fontSize: "0.95rem",
                  }}
                >
                  <td style={{ padding: "16px" }}>
                    {new Date(row.created_at).toLocaleString()}
                  </td>
                  <td
                    style={{
                      padding: "16px",
                      fontFamily: "monospace",
                      fontSize: "0.8rem",
                      color: "var(--text-muted)",
                    }}
                  >
                    {row.order_id}
                  </td>
                  <td style={{ padding: "16px" }}>
                    ${parseFloat(row.order_total.toString()).toFixed(2)}
                  </td>
                  <td style={{ padding: "16px", color: "#F44336" }}>
                    -${parseFloat(row.commission_amount.toString()).toFixed(2)}
                  </td>
                  <td
                    style={{
                      padding: "16px",
                      color: "#4CAF50",
                      fontWeight: 700,
                    }}
                  >
                    +${parseFloat(row.net_earning.toString()).toFixed(2)}
                  </td>
                </tr>
              ))}

              {ledger.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    style={{
                      padding: "40px",
                      textAlign: "center",
                      color: "var(--text-muted)",
                    }}
                  >
                    No earnings history logged yet.
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
