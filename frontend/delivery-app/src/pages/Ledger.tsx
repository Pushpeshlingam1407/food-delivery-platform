import React, { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import api from "../../../shared/services/api";
import { formatIndianCurrency } from "../../../shared/utils/currency";

const categories = [
  "base_pay",
  "distance_pay",
  "time_pay",
  "waiting_charges",
  "pickup_bonus",
  "peak_hour_bonus",
  "rain_bonus",
  "night_bonus",
  "zone_multiplier_bonus",
  "surge_incentive",
  "tip",
  "penalty",
  "cancellation_deduction",
];

export const Ledger: React.FC = () => {
  const [ledger, setLedger] = useState<any[]>([]);
  const [ledgerTotal, setLedgerTotal] = useState(0);
  const [filterPreset, setFilterPreset] = useState("all");
  const [filterCategory, setFilterCategory] = useState("");
  const [ledgerPage, setLedgerPage] = useState(1);
  const [ledgerLoading, setLedgerLoading] = useState(false);

  const fetchLedger = async (
    preset = filterPreset,
    cat = filterCategory,
    pg = ledgerPage,
  ) => {
    setLedgerLoading(true);
    try {
      const res = await api.get(
        `/delivery/earnings/ledger?preset=${preset}&category=${cat}&page=${pg}&limit=8`,
      );
      if (res.data.status === "success") {
        setLedger(res.data.data.transactions || []);
        setLedgerTotal(res.data.data.pagination.total || 0);
      }
    } catch (err) {
      console.error("Fetch ledger error:", err);
    } finally {
      setLedgerLoading(false);
    }
  };

  useEffect(() => {
    fetchLedger(filterPreset, filterCategory, ledgerPage);
  }, [filterPreset, filterCategory, ledgerPage]);

  return (
    <div className="app-shell driver-workspace">
      <header className="driver-workspace__header">
        <div>
          <p className="driver-workspace__eyebrow">Financial Logs</p>
          <h1>Transaction Ledger</h1>
          <p>
            Audit individual payout category details per coordinate order
            delivery.
          </p>
        </div>
      </header>

      {/* Ledger Section */}
      <section className="driver-panel driver-ledger-panel">
        <div className="driver-ledger-header">
          <div>
            <h2 className="driver-ledger-title">Earnings Ledger History</h2>
            <p className="driver-ledger-desc">
              All recorded credits and debits logged dynamically.
            </p>
          </div>

          {/* Ledger Filter Toolbar */}
          <div className="driver-ledger-filter-bar">
            <div className="driver-ledger-preset-btn-group">
              {[
                ["all", "All"],
                ["today", "Today"],
                ["week", "Week"],
                ["month", "Month"],
              ].map(([key, label]) => (
                <button
                  key={key}
                  onClick={() => {
                    setFilterPreset(key);
                    setLedgerPage(1);
                  }}
                  className={`driver-ledger-preset-btn ${filterPreset === key ? "active" : ""}`}
                >
                  {label}
                </button>
              ))}
            </div>

            <select
              value={filterCategory}
              onChange={(e) => {
                setFilterCategory(e.target.value);
                setLedgerPage(1);
              }}
              className="driver-ledger-category-select"
            >
              <option value="">All Categories</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat.replace(/_/g, " ")}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Ledger Grid Table */}
        <div className="table-responsive">
          <table className="driver-ledger-table">
            <thead>
              <tr className="driver-ledger-table-header-row">
                <th>Tx ID</th>
                <th>Timestamp</th>
                <th>Category</th>
                <th>Amount</th>
                <th>Balance After</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {ledgerLoading ? (
                <tr>
                  <td colSpan={6} className="driver-ledger-table-loading">
                    Loading ledger entries...
                  </td>
                </tr>
              ) : ledger.length > 0 ? (
                ledger.map((item) => (
                  <tr key={item.id} className="driver-ledger-table-row">
                    <td className="driver-ledger-tx-id">
                      #{item.id.slice(0, 8).toUpperCase()}
                    </td>
                    <td className="driver-ledger-time">
                      {new Date(item.created_at).toLocaleString()}
                    </td>
                    <td className="driver-ledger-category-cell">
                      <span className="driver-ledger-category-tag">
                        {item.category.replace(/_/g, " ")}
                      </span>
                    </td>
                    <td
                      className={`driver-ledger-amount ${
                        item.type === "credit" ? "credit" : "debit"
                      }`}
                    >
                      {item.type === "credit" ? "+" : "-"}
                      {formatIndianCurrency(item.amount)}
                    </td>
                    <td className="driver-ledger-balance-after">
                      {formatIndianCurrency(item.balance_after)}
                    </td>
                    <td className="driver-ledger-status-cell">
                      <span
                        className={`driver-ledger-status-badge ${
                          item.settlement_status === "settled"
                            ? "driver-ledger-status-settled"
                            : "driver-ledger-status-pending"
                        }`}
                      >
                        {item.settlement_status}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="driver-ledger-table-empty">
                    No transactions found in this time range.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Ledger Paging Toolbar */}
        {ledgerTotal > 8 && (
          <div className="driver-ledger-pagination">
            <span className="driver-ledger-pagination-count">
              Showing {ledger.length} of {ledgerTotal} transactions
            </span>
            <div className="driver-ledger-pagination-buttons">
              <button
                disabled={ledgerPage === 1 || ledgerLoading}
                onClick={() => setLedgerPage((p) => Math.max(1, p - 1))}
                className={`driver-ledger-page-btn prev ${ledgerPage === 1 ? "disabled" : ""}`}
              >
                <ChevronLeft size={16} /> Prev
              </button>
              <button
                disabled={ledgerPage * 8 >= ledgerTotal || ledgerLoading}
                onClick={() => setLedgerPage((p) => p + 1)}
                className={`driver-ledger-page-btn next ${ledgerPage * 8 >= ledgerTotal ? "disabled" : ""}`}
              >
                Next <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </section>
    </div>
  );
};
