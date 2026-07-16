import React, { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
import {
  Check,
  Navigation,
  Power,
  Truck,
  Wallet,
  TrendingUp,
  Clock,
  Award,
  ChevronLeft,
  ChevronRight,
  Filter,
  Calendar,
  AlertCircle,
  FileText,
} from "lucide-react";
import notify from "../../../shared/utils/toast";
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
  const [payoutAmount, setPayoutAmount] = useState("");
  const [payoutLoading, setPayoutLoading] = useState(false);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [deliveryStep, setDeliveryStep] = useState<
    "accepted" | "arrived_store" | "picked_up"
  >("accepted");
  const [deliveryTimer, setDeliveryTimer] = useState(600);
  const [gpsProgress, setGpsProgress] = useState(0);
  const [completedDeliveriesCount, setCompletedDeliveriesCount] = useState(0);
  const [totalEarningAmt, setTotalEarningAmt] = useState(0);

  // New Earnings & Fintech States
  const [ledger, setLedger] = useState<any[]>([]);
  const [ledgerTotal, setLedgerTotal] = useState(0);
  const [analytics, setAnalytics] = useState<any>({
    totalEarnings: 0,
    onlineHours: 0,
    idleHours: 0,
    completionRate: 100,
    cancellationRate: 0,
    acceptanceRate: 95,
    breakdown: {},
    dailyTrend: [],
    hourlyTrend: [],
    heatmaps: [],
  });
  const [filterPreset, setFilterPreset] = useState("all");
  const [filterCategory, setFilterCategory] = useState("");
  const [ledgerPage, setLedgerPage] = useState(1);
  const [ledgerLoading, setLedgerLoading] = useState(false);

  const driverName = localStorage.getItem("userName") || "Driver";

  const simulateGPSMovement = (orderId: string) => {
    let lat = 12.9716;
    let lon = 77.5946;
    let stepCount = 0;
    setGpsProgress(0);

    const interval = setInterval(() => {
      if (stepCount >= 10) {
        clearInterval(interval);
        return;
      }
      lat += 0.0005;
      lon += 0.0005;
      stepCount += 1;
      setGpsProgress(stepCount * 10);
      socket?.emit("updateLocation", {
        orderId,
        latitude: lat,
        longitude: lon,
      });
    }, 4000);
  };

  const fetchLedger = async (preset: string = filterPreset, cat: string = filterCategory, pg: number = ledgerPage) => {
    setLedgerLoading(true);
    try {
      const res = await api.get(
        `/delivery/earnings/ledger?preset=${preset}&category=${cat}&page=${pg}&limit=6`
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

  const fetchAnalytics = async () => {
    try {
      const res = await api.get("/delivery/earnings/analytics");
      if (res.data.status === "success" && res.data.data) {
        setAnalytics(res.data.data);
      }
    } catch (err) {
      console.error("Fetch analytics error:", err);
    }
  };

  const fetchDriverStats = async () => {
    try {
      const meRes = await api.get("/auth/me");
      let currentDriverId = "";
      if (meRes.data.status === "success" && meRes.data.data) {
        const online = !!meRes.data.data.is_online;
        setIsOnline(online);
        localStorage.setItem("driverOnline", String(online));
        window.dispatchEvent(new Event("driver-shift-change"));
        currentDriverId = meRes.data.data.id;
      }

      const [walletRes, ordersRes] = await Promise.all([
        api.get("/wallets"),
        api.get("/orders"),
      ]);

      if (walletRes.data.status === "success") {
        setWalletBalance(parseFloat(walletRes.data.data.balance || "0"));
        setTransactions(walletRes.data.data.transactions || []);
      }
      if (ordersRes.data.status === "success") {
        const allOrders = ordersRes.data.data || [];
        setJobs(
          allOrders.filter(
            (order: Order) => order.status === "ready_for_pickup"
          )
        );
        setActiveJob(
          allOrders.find(
            (order: Order) => order.status === "out_for_delivery"
          ) || null
        );
        if (currentDriverId) {
          const completed = allOrders.filter(
            (order: any) =>
              order.status === "delivered" &&
              order.delivery_partner_id === currentDriverId
          );
          setCompletedDeliveriesCount(completed.length);
          setTotalEarningAmt(
            completed.reduce(
              (sum: number, order: any) =>
                sum + parseFloat(order.delivery_charges || "0"),
              0
            )
          );
        }
      }
    } catch (error) {
      console.error("Unable to load driver dashboard:", error);
    }
  };

  useEffect(() => {
    fetchDriverStats();
    fetchAnalytics();
    fetchLedger(filterPreset, filterCategory, ledgerPage);

    const ioSocket = io("http://localhost:5000");
    setSocket(ioSocket);

    return () => {
      ioSocket.disconnect();
    };
  }, []);

  useEffect(() => {
    fetchLedger(filterPreset, filterCategory, ledgerPage);
  }, [filterPreset, filterCategory, ledgerPage]);

  useEffect(() => {
    if (!activeJob) {
      setActiveJobDetails(null);
      return;
    }
    api
      .get(`/orders/${activeJob.id}`)
      .then((res) => {
        if (res.data.status === "success") setActiveJobDetails(res.data.data);
      })
      .catch(console.error);

    const savedStep = localStorage.getItem(`delivery_step_${activeJob.id}`);
    setDeliveryStep(
      (savedStep as "accepted" | "arrived_store" | "picked_up") || "accepted"
    );
  }, [activeJob?.id]);

  useEffect(() => {
    if (!activeJob || deliveryStep !== "picked_up") return;
    const interval = window.setInterval(
      () => setDeliveryTimer((time) => time - 1),
      1000
    );
    return () => window.clearInterval(interval);
  }, [activeJob, deliveryStep]);

  const handleToggleOnline = async () => {
    const nextOnlineState = !isOnline;
    try {
      const response = await api.put("/delivery/status", {
        is_online: nextOnlineState,
      });
      if (response.data.status === "success") {
        setIsOnline(nextOnlineState);
        localStorage.setItem("driverOnline", String(nextOnlineState));
        window.dispatchEvent(new Event("driver-shift-change"));
        if (nextOnlineState) {
          notify.success("You are now online and ready to accept orders.");
        } else {
          notify.error("You are now offline.");
        }
        await fetchDriverStats();
        await fetchAnalytics();
      }
    } catch {
      notify.error("We couldn't change your status.");
    }
  };

  const handleAcceptJob = async (orderId: string) => {
    try {
      const response = await api.put(`/orders/${orderId}/status`, {
        status: "out_for_delivery",
      });
      if (response.data.status === "success") {
        localStorage.setItem(`delivery_step_${orderId}`, "accepted");
        setDeliveryStep("accepted");
        await fetchDriverStats();
        notify.success("Delivery accepted! Head to the restaurant.");
      }
    } catch {
      notify.error("We couldn't accept this delivery right now.");
    }
  };

  const handleDeliverJob = async () => {
    if (!activeJob) return;
    try {
      const response = await api.put(`/orders/${activeJob.id}/status`, {
        status: "delivered",
      });
      if (response.data.status === "success") {
        localStorage.removeItem(`delivery_step_${activeJob.id}`);
        setActiveJob(null);
        await fetchDriverStats();
        await fetchAnalytics();
        await fetchLedger();
        notify.success("Delivery complete! Great job.");
      }
    } catch {
      notify.error("We couldn't complete this delivery.");
    }
  };

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
        await fetchDriverStats();
        await fetchAnalytics();
        await fetchLedger();
        notify.success("Payout requested successfully.");
      }
    } catch (error: any) {
      notify.error(
        error.response?.data?.message ||
          "We couldn't request your payout right now."
      );
    } finally {
      setPayoutLoading(false);
    }
  };

  const greeting =
    new Date().getHours() < 12
      ? "morning"
      : new Date().getHours() < 18
        ? "afternoon"
        : "evening";

  const activeStep =
    deliveryStep === "accepted"
      ? "Head to restaurant"
      : deliveryStep === "arrived_store"
        ? "Collect order"
        : "Deliver order";

  const remainingTime = `${Math.max(0, Math.floor(deliveryTimer / 60))
    .toString()
    .padStart(2, "0")}:${Math.max(0, deliveryTimer % 60)
    .toString()
    .padStart(2, "0")}`;

  const moveToPickup = () => {
    if (!activeJob) return;
    setDeliveryStep("arrived_store");
    localStorage.setItem(`delivery_step_${activeJob.id}`, "arrived_store");
  };

  const startDelivery = () => {
    if (!activeJob) return;
    setDeliveryStep("picked_up");
    setDeliveryTimer(600);
    localStorage.setItem(`delivery_step_${activeJob.id}`, "picked_up");
    socket?.emit("joinRoom", { room: `order_${activeJob.id}` });
    simulateGPSMovement(activeJob.id);
  };

  // SVG Chart Helper
  const maxTrend = analytics.dailyTrend?.length
    ? Math.max(...analytics.dailyTrend.map((t: any) => t.amount), 100)
    : 100;

  return (
    <div className="app-shell driver-workspace">
      <header className="driver-workspace__header">
        <div>
          <p className="driver-workspace__eyebrow">Driver workspace</p>
          <h1>
            Good {greeting}, {driverName}
          </h1>
          <p>
            {isOnline
              ? "You are available for new delivery requests."
              : "You are offline. Go online when you are ready to work."}
          </p>
        </div>
        <div className="driver-workspace__shift">
          <span
            className={`driver-status ${isOnline ? "is-online" : "is-offline"}`}
          >
            <i />
            {isOnline ? "Online" : "Offline"}
          </span>
          <button
            type="button"
            className={`driver-shift-button ${isOnline ? "is-online" : ""}`}
            onClick={handleToggleOnline}
          >
            <Power size={17} /> {isOnline ? "End shift" : "Start shift"}
          </button>
        </div>
      </header>

      {/* Quest Incentive Challenge Card */}
      <section className="driver-quest-card-section">
        <div className="driver-panel driver-quest-card">
          <div className="driver-quest-header">
            <div className="driver-quest-content-flex">
              <div className="driver-quest-icon-wrapper">
                <Award size={32} color="#fcd34d" />
              </div>
              <div>
                <h3 className="driver-quest-title">
                  Streak Incentive Challenge
                </h3>
                <p className="driver-quest-subtitle">
                  Complete 8 orders today to unlock a bonus of ₹250.00
                </p>
              </div>
            </div>
            <div>
              <span className="driver-quest-bonus-tag">
                ₹250 Extra
              </span>
            </div>
          </div>
          <div className="driver-quest-progress-bar-wrapper">
            <div className="driver-quest-progress-container">
              <span>
                Progress: {completedDeliveriesCount} of 8 completed
              </span>
              <span>
                {Math.min(100, Math.round((completedDeliveriesCount / 8) * 100))}%
              </span>
            </div>
            <div className="driver-quest-progress-track">
              <div
                className="driver-quest-progress-fill"
                style={{
                  width: `${Math.min(100, (completedDeliveriesCount / 8) * 100)}%`,
                }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Fintech Stats Grid */}
      <section
        className="driver-stat-grid"
        aria-label="Today’s delivery summary"
      >
        <article>
          <span className="driver-stat-title-flex">
            <TrendingUp size={14} color="var(--accent-orange)" /> Cumulative Earnings
          </span>
          <strong>{formatIndianCurrency(analytics.totalEarnings || totalEarningAmt)}</strong>
          <small>Incl. bonuses & tips</small>
        </article>
        <article>
          <span className="driver-stat-title-flex">
            <Clock size={14} color="#6366f1" /> Shift Log Hours
          </span>
          <strong>{analytics.onlineHours || 0} hrs</strong>
          <small>{analytics.idleHours || 0} hrs idle time</small>
        </article>
        <article>
          <span className="driver-stat-title-flex">
            <Award size={14} color="#10b981" /> Order Operations
          </span>
          <div className="driver-stat-ops-flex">
            <div>
              <div className="driver-ops-number">
                {analytics.completionRate}%
              </div>
              <div className="driver-ops-label">
                Completion
              </div>
            </div>
            <div className="driver-ops-divider">
              <div className="driver-ops-number">
                {analytics.acceptanceRate}%
              </div>
              <div className="driver-ops-label">
                Acceptance
              </div>
            </div>
          </div>
        </article>
      </section>

      {/* Active Job & Queue grid */}
      <div className="driver-workspace__grid">
        <section
          className="driver-panel driver-current-job"
          id="driver-job-section"
        >
          <div className="driver-panel__heading">
            <div>
              <p>Current delivery</p>
              <h2>
                {activeJob
                  ? `Order #${activeJob.order_number}`
                  : "No delivery in progress"}
              </h2>
              {activeJob && (
                <p className="driver-order-id-label">ID: {activeJob.id}</p>
              )}
            </div>
            {activeJob && (
              <span className="driver-step-label">{activeStep}</span>
            )}
          </div>

          {activeJob ? (
            <>
              <div className="driver-route">
                <div>
                  <span>Pick up</span>
                  <strong>{activeJob.restaurant_name}</strong>
                  <p>Restaurant</p>
                </div>
                <div>
                  <span>Drop off</span>
                  <strong>
                    {activeJobDetails?.street_address ||
                      activeJob.street_address}
                  </strong>
                  <p>{activeJobDetails?.city || activeJob.city}</p>
                </div>
              </div>
              <div
                className="driver-progress"
                aria-label={`Delivery step: ${activeStep}`}
              >
                {[
                  ["accepted", "1", "To pickup"],
                  ["arrived_store", "2", "At restaurant"],
                  ["picked_up", "3", "Deliver"],
                ].map(([step, number, label]) => (
                  <div
                    key={step}
                    className={
                      deliveryStep === step ||
                      (deliveryStep === "arrived_store" &&
                        step === "accepted") ||
                      deliveryStep === "picked_up"
                        ? "is-complete"
                        : ""
                    }
                  >
                    <b>{number}</b>
                    <span>{label}</span>
                  </div>
                ))}
              </div>

              {/* Map simulation container */}
              <div className="driver-map-preview">
                <div className="driver-map-bg">
                  <div className="driver-map-streets" />
                  <div className="driver-map-marker marker-restaurant">
                    <span>Rest.</span>
                  </div>
                  <div className="driver-map-marker marker-customer">
                    <span>Cust.</span>
                  </div>
                  <div
                    className="driver-map-marker marker-driver"
                    style={{
                      top: `${130 + (gpsProgress / 100) * 80}px`,
                      left: `${130 + (gpsProgress / 100) * 110}px`,
                    }}
                  >
                    <Truck size={12} />
                    <span>You</span>
                  </div>
                </div>
                <div className="driver-map-gps-bar">
                  <div
                    className="driver-map-gps-fill"
                    style={{ width: `${gpsProgress}%` }}
                  />
                </div>
              </div>

              <div className="driver-current-job__footer">
                {deliveryStep === "picked_up" && (
                  <span className="driver-timer">
                    {remainingTime} left · {gpsProgress}% route sync
                  </span>
                )}
                {deliveryStep === "accepted" && (
                  <button
                    type="button"
                    className="driver-primary-button"
                    onClick={moveToPickup}
                  >
                    <Navigation size={17} /> I’m at the restaurant
                  </button>
                )}
                {deliveryStep === "arrived_store" && (
                  <button
                    type="button"
                    className="driver-primary-button"
                    onClick={startDelivery}
                  >
                    <Check size={17} /> Picked up order
                  </button>
                )}
                {deliveryStep === "picked_up" && (
                  <button
                    type="button"
                    className="driver-primary-button"
                    onClick={handleDeliverJob}
                  >
                    <Check size={17} /> Complete delivery
                  </button>
                )}
              </div>
            </>
          ) : (
            <div className="driver-empty-state">
              <Truck size={22} />
              <div>
                <strong>Your next delivery will show here.</strong>
                <p>Accept a request from the queue when you are online.</p>
              </div>
            </div>
          )}
        </section>

        {/* Requests Queue */}
        <section className="driver-panel driver-queue">
          <div className="driver-panel__heading">
            <div>
              <p>Available requests</p>
              <h2>Pickup queue</h2>
            </div>
            <span>{jobs.length}</span>
          </div>
          <div className="driver-queue__list">
            {jobs.slice(0, 4).map((job) => (
              <article key={job.id} className="driver-queue-item">
                <div>
                  <strong>{job.restaurant_name}</strong>
                  <p>
                    {job.city} · Order #{job.order_number}
                  </p>
                  <p className="driver-order-id-label">ID: {job.id}</p>
                </div>
                <div className="driver-queue-item__action">
                  <strong>{formatIndianCurrency(job.delivery_charges)}</strong>
                  <button
                    type="button"
                    disabled={!isOnline || !!activeJob}
                    onClick={() => handleAcceptJob(job.id)}
                  >
                    Accept
                  </button>
                </div>
              </article>
            ))}
            {jobs.length === 0 && (
              <div className="driver-queue__empty">
                No requests are waiting right now.
              </div>
            )}
          </div>
        </section>
      </div>

      {/* Analytics Charts & Heatmaps */}
      <section className="driver-analytics-charts-grid">
        {/* SVG Earning Trend Card */}
        <div className="driver-panel">
          <h3 className="driver-chart-heading">
            Earning Trend (Last 7 Days)
          </h3>
          {analytics.dailyTrend?.length > 0 ? (
            <div className="driver-trend-chart-outer">
              <div className="driver-trend-bar-chart-container">
                {analytics.dailyTrend.map((t: any, idx: number) => {
                  const percentHeight = Math.max(10, Math.round((t.amount / maxTrend) * 100));
                  return (
                    <div
                      key={idx}
                      className="driver-trend-col"
                    >
                      <span className="driver-trend-bar-label">
                        ₹{Math.round(t.amount)}
                      </span>
                      <div
                        className="driver-trend-bar"
                        style={{
                          height: `${percentHeight}px`,
                        }}
                      />
                      <span className="driver-trend-bar-date">
                        {new Date(t.date).toLocaleDateString(undefined, {
                          weekday: "short",
                        })}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="driver-chart-empty">
              No earning trends available yet.
            </div>
          )}
        </div>

        {/* Heatmap Zones Card */}
        <div className="driver-panel">
          <h3 className="driver-chart-heading">
            Peak Demand Zones Heatmap
          </h3>
          <div className="driver-heatmap-list">
            {analytics.heatmaps?.length > 0 ? (
              analytics.heatmaps.map((h: any, idx: number) => (
                <div
                  key={idx}
                  className="driver-heatmap-item"
                >
                  <div className="driver-heatmap-left">
                    <span
                      className="driver-heatmap-dot"
                      style={{
                        background: idx === 0 ? "#ef4444" : idx === 1 ? "#f59e0b" : "#10b981",
                        color: idx === 0 ? "#ef4444" : idx === 1 ? "#f59e0b" : "#10b981",
                      }}
                    />
                    <strong className="driver-heatmap-zone-name">{h.zone}</strong>
                  </div>
                  <div className="driver-heatmap-right">
                    <div className="driver-heatmap-value">
                      {formatIndianCurrency(h.earnings)}
                    </div>
                    <div className="driver-heatmap-count">
                      {h.count} deliveries finished
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="driver-chart-empty">
                No zone coordinates tracked yet.
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Ledger Section */}
      <section id="driver-ledger-section" className="driver-panel driver-ledger-panel">
        <div className="driver-ledger-header">
          <div>
            <h2 className="driver-ledger-title">
              Earnings Transaction Ledger
            </h2>
            <p className="driver-ledger-desc">
              Individual transaction items generated per coordinate delivery.
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
        {ledgerTotal > 6 && (
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
                disabled={ledgerPage * 6 >= ledgerTotal || ledgerLoading}
                onClick={() => setLedgerPage((p) => p + 1)}
                className={`driver-ledger-page-btn next ${ledgerPage * 6 >= ledgerTotal ? "disabled" : ""}`}
              >
                Next <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </section>

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
    </div>
  );
};
