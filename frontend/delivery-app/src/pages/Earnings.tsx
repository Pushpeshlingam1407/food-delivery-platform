import React, { useEffect, useState } from "react";
import { TrendingUp, Clock, Award } from "lucide-react";
import api from "../../../shared/services/api";
import { formatIndianCurrency } from "../../../shared/utils/currency";

export const Earnings: React.FC = () => {
  const [completedDeliveriesCount, setCompletedDeliveriesCount] = useState(0);
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

  const fetchEarningsData = async () => {
    try {
      const [analyticsRes, ordersRes] = await Promise.all([
        api.get("/delivery/earnings/analytics"),
        api.get("/orders"),
      ]);

      if (analyticsRes.data.status === "success" && analyticsRes.data.data) {
        setAnalytics(analyticsRes.data.data);
      }

      if (ordersRes.data.status === "success") {
        const meRes = await api.get("/auth/me");
        if (meRes.data.status === "success" && meRes.data.data) {
          const driverId = meRes.data.data.id;
          const completed = ordersRes.data.data.filter(
            (order: any) =>
              order.status === "delivered" &&
              order.delivery_partner_id === driverId,
          );
          setCompletedDeliveriesCount(completed.length);
        }
      }
    } catch (err) {
      console.error("Fetch earnings data failed:", err);
    }
  };

  useEffect(() => {
    fetchEarningsData();
  }, []);

  const maxTrend = analytics.dailyTrend?.length
    ? Math.max(...analytics.dailyTrend.map((t: any) => t.amount), 100)
    : 100;

  return (
    <div className="app-shell driver-workspace">
      <header className="driver-workspace__header">
        <div>
          <p className="driver-workspace__eyebrow">Finance Insights</p>
          <h1>Earnings & Incentive Analytics</h1>
          <p>
            Track your cumulative income, weekly challenges, and target goals.
          </p>
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
              <span className="driver-quest-bonus-tag">₹250 Extra</span>
            </div>
          </div>
          <div className="driver-quest-progress-bar-wrapper">
            <div className="driver-quest-progress-container">
              <span>Progress: {completedDeliveriesCount} of 8 completed</span>
              <span>
                {Math.min(
                  100,
                  Math.round((completedDeliveriesCount / 8) * 100),
                )}
                %
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
      <section className="driver-stat-grid">
        <article>
          <span className="driver-stat-title-flex">
            <TrendingUp size={14} color="var(--accent-orange)" /> Cumulative
            Earnings
          </span>
          <strong>{formatIndianCurrency(analytics.totalEarnings || 0)}</strong>
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
              <div className="driver-ops-label">Completion</div>
            </div>
            <div className="driver-ops-divider">
              <div className="driver-ops-number">
                {analytics.acceptanceRate}%
              </div>
              <div className="driver-ops-label">Acceptance</div>
            </div>
          </div>
        </article>
      </section>

      {/* Charts Grid */}
      <section className="driver-analytics-charts-grid">
        {/* SVG Earning Trend Card */}
        <div className="driver-panel">
          <h3 className="driver-chart-heading">Earning Trend (Last 7 Days)</h3>
          {analytics.dailyTrend?.length > 0 ? (
            <div className="driver-trend-chart-outer">
              <div className="driver-trend-bar-chart-container">
                {analytics.dailyTrend.map((t: any, idx: number) => {
                  const percentHeight = Math.max(
                    10,
                    Math.round((t.amount / maxTrend) * 100),
                  );
                  return (
                    <div key={idx} className="driver-trend-col">
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
          <h3 className="driver-chart-heading">Peak Demand Zones Heatmap</h3>
          <div className="driver-heatmap-list">
            {analytics.heatmaps?.length > 0 ? (
              analytics.heatmaps.map((h: any, idx: number) => (
                <div key={idx} className="driver-heatmap-item">
                  <div className="driver-heatmap-left">
                    <span
                      className="driver-heatmap-dot"
                      style={{
                        background:
                          idx === 0
                            ? "#ef4444"
                            : idx === 1
                              ? "#f59e0b"
                              : "#10b981",
                        color:
                          idx === 0
                            ? "#ef4444"
                            : idx === 1
                              ? "#f59e0b"
                              : "#10b981",
                      }}
                    />
                    <strong className="driver-heatmap-zone-name">
                      {h.zone}
                    </strong>
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
    </div>
  );
};
