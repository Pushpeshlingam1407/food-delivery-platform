import React, { useEffect, useState } from "react";
import {
  DollarSign,
  TrendingUp,
  Wallet,
  CheckCircle,
  Clock,
  ArrowUpRight,
  ArrowDownLeft,
  Building
} from "lucide-react";
import notify from "../../../shared/utils/toast";
import api from "../../../shared/services/api";

import { PremiumPageHeader } from "../components/ui/PremiumPageHeader";
import { CredStatCard } from "../components/ui/CredStatCard";
import { TransactionLedger } from "../components/ui/TransactionLedger";

import "../restaurant-premium.css";

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
      <div style={{ padding: "40px", color: "var(--cred-text-secondary)", textAlign: "center" }}>
        Loading premium dashboard...
      </div>
    );
  }

  const walletColumns = [
    { key: "created_at", label: "Date", flex: 2, render: (val: string) => new Date(val).toLocaleDateString() },
    { key: "description", label: "Description", flex: 3 },
    { 
      key: "type", 
      label: "Type", 
      flex: 1.5,
      render: (val: string) => (
        <span className={`premium-badge ${val === "credit" ? "success" : "danger"}`}>
          {val}
        </span>
      )
    },
    { 
      key: "amount", 
      label: "Amount", 
      flex: 1.5,
      render: (val: string, row: any) => (
        <span style={{ color: row.type === "credit" ? "var(--cred-success)" : "var(--cred-text-primary)", fontWeight: 800 }}>
          {row.type === "credit" ? "+" : "-"}${parseFloat(val).toFixed(2)}
        </span>
      )
    }
  ];

  const orderColumns = [
    { key: "created_at", label: "Date", flex: 2, render: (val: string) => new Date(val).toLocaleDateString() },
    { key: "order_id", label: "Order ID", flex: 2, render: (val: string) => <span style={{ opacity: 0.7 }}>#{val.slice(-6)}</span> },
    { key: "order_total", label: "Gross", flex: 1.5, render: (val: string) => `$${parseFloat(val).toFixed(2)}` },
    { key: "commission_amount", label: "Fee", flex: 1.5, render: (val: string) => <span style={{ color: "var(--cred-accent)" }}>-${parseFloat(val).toFixed(2)}</span> },
    { key: "net_earning", label: "Net", flex: 1.5, render: (val: string) => <span style={{ color: "var(--cred-success)", fontWeight: 800 }}>+${parseFloat(val).toFixed(2)}</span> },
  ];

  return (
    <div className="restaurant-dark-mode" style={{ minHeight: "100vh", padding: "40px 20px", background: "var(--cred-bg)" }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        <PremiumPageHeader 
          title="Merchant Finances"
          subtitle="Manage payouts, track sales revenues, and review platform ledger records."
          rightAction={
            <div className="premium-badge neutral" style={{ gap: "8px", fontSize: "0.85rem", padding: "10px 16px" }}>
              <Building size={16} /> Active Account <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "var(--cred-success)" }} />
            </div>
          }
        />

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "24px", marginBottom: "40px" }} className="premium-animate-in">
          <CredStatCard 
            title="Available Balance"
            value={`$${walletBalance.toFixed(2)}`}
            subtitle="Ready for Instant Payout"
            icon={<Wallet />}
            theme="success"
          />
          <CredStatCard 
            title="Net Earnings"
            value={`$${parseFloat(summary?.net_earnings?.toString() || "0").toFixed(2)}`}
            subtitle="Total platform payouts"
            icon={<TrendingUp />}
          />
          <CredStatCard 
            title="Total Orders"
            value={summary?.total_orders || 0}
            subtitle="Completed deliveries"
            icon={<CheckCircle />}
          />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "40px", marginBottom: "60px" }}>
          
          {/* Payout Section */}
          <div className="cred-stat-card" style={{ padding: "40px" }}>
            <div style={{ marginBottom: "24px" }}>
              <h2 style={{ fontSize: "1.8rem", fontWeight: 800, marginBottom: "8px", color: "var(--cred-text-primary)", letterSpacing: "-1px" }}>Instant Payout</h2>
              <p style={{ color: "var(--cred-text-secondary)" }}>Withdraw funds directly to your linked bank account instantly.</p>
            </div>
            
            <form onSubmit={handlePayoutSubmit} style={{ maxWidth: "500px" }}>
              <div className="neo-input-wrapper" style={{ marginBottom: "20px" }}>
                <input 
                  type="number" 
                  className="neo-input"
                  placeholder=" " 
                  value={payoutAmount}
                  onChange={(e) => setPayoutAmount(e.target.value)}
                  step="0.01"
                  min="0.01"
                  max={walletBalance}
                  required
                />
                <label>Amount to Withdraw ($)</label>
              </div>

              <div style={{ display: "flex", gap: "12px", marginBottom: "32px", flexWrap: "wrap" }}>
                {[50, 100, 500].map((amt) => (
                  <button 
                    key={amt}
                    type="button" 
                    className="premium-badge neutral"
                    onClick={() => handleQuickFill(amt)}
                    style={{ cursor: "pointer", border: "1px solid var(--cred-border)", background: "transparent", color: "var(--cred-text-primary)" }}
                  >
                    +${amt}
                  </button>
                ))}
                <button 
                  type="button" 
                  className="premium-badge success"
                  onClick={() => handleQuickFill(walletBalance)}
                  style={{ cursor: "pointer", background: "rgba(0, 208, 156, 0.15)", border: "1px solid rgba(0, 208, 156, 0.4)" }}
                >
                  Max (${walletBalance.toFixed(2)})
                </button>
              </div>

              <button 
                type="submit" 
                className="neo-btn neo-btn-primary" 
                style={{ width: "100%", padding: "20px", fontSize: "1.2rem" }}
                disabled={payoutLoading || walletBalance <= 0 || !payoutAmount}
              >
                {payoutLoading ? "Processing..." : "Withdraw Funds"} <ArrowUpRight size={24} />
              </button>
            </form>
          </div>

          {/* Ledger Sections */}
          <div style={{ display: "flex", flexDirection: "column", gap: "40px" }}>
            <div>
              <h3 style={{ fontSize: "1.2rem", fontWeight: 800, color: "var(--cred-text-primary)", marginBottom: "24px", letterSpacing: "1px", textTransform: "uppercase" }}>Wallet Transactions</h3>
              <TransactionLedger columns={walletColumns} data={walletTransactions} />
            </div>
            
            <div>
              <h3 style={{ fontSize: "1.2rem", fontWeight: 800, color: "var(--cred-text-primary)", marginBottom: "24px", letterSpacing: "1px", textTransform: "uppercase" }}>Order Earnings History</h3>
              <TransactionLedger columns={orderColumns} data={ledger} />
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
};
