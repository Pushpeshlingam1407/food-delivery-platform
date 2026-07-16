import React, { useEffect, useState } from "react";
import { Wallet } from "lucide-react";
import api from "../../../shared/services/api";
import notify from "../../../shared/utils/toast";
import { formatIndianCurrency } from "../../../shared/utils/currency";

export const WalletPage: React.FC = () => {
  const [walletBalance, setWalletBalance] = useState(0);
  const [payoutAmount, setPayoutAmount] = useState("");
  const [payoutLoading, setPayoutLoading] = useState(false);
  const [transactions, setTransactions] = useState<any[]>([]);

  const fetchWalletDetails = async () => {
    try {
      const res = await api.get("/wallets");
      if (res.data.status === "success") {
        setWalletBalance(parseFloat(res.data.data.balance || "0"));
        setTransactions(res.data.data.transactions || []);
      }
    } catch (err) {
      console.error("Fetch wallet details failed:", err);
    }
  };

  useEffect(() => {
    fetchWalletDetails();
  }, []);

  const handleRequestPayout = async (event: React.FormEvent) => {
    event.preventDefault();
    const amount = parseFloat(payoutAmount);
    if (!amount || amount <= 0 || amount > walletBalance) {
      notify.warning("Please enter a valid amount from your balance.");
      return;
    }
    setPayoutLoading(true);
    try {
      const response = await api.post("/wallets/payout", { amount });
      if (response.data.status === "success") {
        setPayoutAmount("");
        await fetchWalletDetails();
        notify.success("Payout requested successfully.");
      }
    } catch (error: any) {
      notify.error(
        error.response?.data?.message || "We couldn't request your payout right now."
      );
    } finally {
      setPayoutLoading(false);
    }
  };

  return (
    <div className="app-shell driver-workspace">
      <header className="driver-workspace__header">
        <div>
          <p className="driver-workspace__eyebrow">Finance Console</p>
          <h1>Driver Payout Wallet</h1>
          <p>Request instant payouts and review your historical settlement transactions.</p>
        </div>
      </header>

      {/* Wallet Management Section */}
      <section className="driver-wallet" id="driver-wallet-section">
        <div>
          <div className="driver-wallet__icon">
            <Wallet size={19} />
          </div>
          <div>
            <p>Wallet Available Balance</p>
            <h2>
              {formatIndianCurrency(walletBalance)} <span>available</span>
            </h2>
          </div>
        </div>
        <form onSubmit={handleRequestPayout}>
          <input
            className="input-premium"
            type="number"
            min="0"
            step="0.01"
            value={payoutAmount}
            onChange={(event) => setPayoutAmount(event.target.value)}
            placeholder="Amount to withdraw"
          />
          <button type="submit" disabled={payoutLoading || walletBalance <= 0}>
            {payoutLoading ? "Requesting..." : "Cash out"}
          </button>
        </form>
        <div className="driver-wallet__activity">
          {transactions[0] ? (
            <>
              <strong>Latest activity</strong>
              <span>{transactions[0].description}</span>
            </>
          ) : (
            "Your payout activity will appear here."
          )}
        </div>
      </section>

      {/* Historical Payout Logs */}
      <section className="driver-panel" style={{ marginTop: "24px" }}>
        <div className="driver-panel__heading">
          <div>
            <p>Cashout Logs</p>
            <h2>Latest Activities</h2>
          </div>
        </div>
        <div className="table-responsive" style={{ marginTop: "16px" }}>
          <table className="driver-ledger-table">
            <thead>
              <tr className="driver-ledger-table-header-row">
                <th>Reference ID</th>
                <th>Description</th>
                <th>Amount</th>
                <th>Type</th>
                <th>Timestamp</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((tx) => (
                <tr key={tx.id} className="driver-ledger-table-row">
                  <td className="driver-ledger-tx-id">#{tx.id.slice(0, 8).toUpperCase()}</td>
                  <td style={{ padding: "14px 16px", fontSize: "0.85rem" }}>{tx.description}</td>
                  <td style={{ padding: "14px 16px", fontSize: "0.85rem", fontWeight: 800 }}>
                    {formatIndianCurrency(Math.abs(parseFloat(tx.amount)))}
                  </td>
                  <td style={{ padding: "14px 16px" }}>
                    <span
                      style={{
                        background: tx.type === "credit" ? "#e6f4ea" : "#fce8e6",
                        color: tx.type === "credit" ? "#137333" : "#c5221f",
                        fontSize: "0.7rem",
                        fontWeight: 800,
                        padding: "4px 8px",
                        borderRadius: "6px",
                        textTransform: "uppercase",
                      }}
                    >
                      {tx.type}
                    </span>
                  </td>
                  <td style={{ padding: "14px 16px", fontSize: "0.85rem", color: "#64748b" }}>
                    {new Date(tx.created_at).toLocaleString()}
                  </td>
                </tr>
              ))}
              {transactions.length === 0 && (
                <tr>
                  <td colSpan={5} style={{ padding: "30px", textAlign: "center", color: "#64748b" }}>
                    No payout transactions recorded.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};
