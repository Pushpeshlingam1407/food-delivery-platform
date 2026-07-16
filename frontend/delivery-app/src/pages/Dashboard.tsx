import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Power,
  ShieldAlert,
  Bell,
  ArrowRight,
  TrendingUp,
  Clock,
  Award,
} from "lucide-react";
import notify from "../../../shared/utils/toast";
import api from "../../../shared/services/api";
import { formatIndianCurrency } from "../../../shared/utils/currency";

export const Dashboard: React.FC = () => {
  const [isOnline, setIsOnline] = useState(false);
  const [analytics, setAnalytics] = useState<any>({
    totalEarnings: 0,
    onlineHours: 0,
    idleHours: 0,
    completionRate: 100,
    acceptanceRate: 95,
  });

  const driverName = localStorage.getItem("userName") || "Driver";

  const fetchDriverShiftDetails = async () => {
    try {
      const meRes = await api.get("/auth/me");
      if (meRes.data.status === "success" && meRes.data.data) {
        const online = !!meRes.data.data.is_online;
        setIsOnline(online);
        localStorage.setItem("driverOnline", String(online));
        window.dispatchEvent(new Event("driver-shift-change"));
      }

      const analyticsRes = await api.get("/delivery/earnings/analytics");
      if (analyticsRes.data.status === "success" && analyticsRes.data.data) {
        setAnalytics(analyticsRes.data.data);
      }
    } catch (error) {
      console.error("Unable to load driver shift details:", error);
    }
  };

  useEffect(() => {
    fetchDriverShiftDetails();
  }, []);

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
        await fetchDriverShiftDetails();
      }
    } catch {
      notify.error("We couldn't change your status.");
    }
  };

  const greeting =
    new Date().getHours() < 12
      ? "morning"
      : new Date().getHours() < 18
        ? "afternoon"
        : "evening";

  return (
    <div className="app-shell driver-workspace">
      <header className="driver-workspace__header">
        <div>
          <p className="driver-workspace__eyebrow">Shift Console</p>
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

      {/* Quick Launch Board */}
      <section className="driver-panel driver-profile-overview-card">
        <div className="driver-quest-header">
          <div>
            <h2 className="driver-profile-name">Shift Handoff Operations</h2>
            <p className="driver-quest-subtitle">
              Ready to deliver? View active routes, customer orders, and pickup queues.
            </p>
          </div>
          <div>
            <Link to="/deliveries" className="driver-primary-button">
              Go to Job Board <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* Operational Stats Grid */}
      <section className="driver-stat-grid driver-profile-grid-margin">
        <article>
          <span className="driver-stat-title-flex">
            <TrendingUp size={14} color="var(--accent-orange)" /> Today’s Earnings
          </span>
          <strong>{formatIndianCurrency(analytics.totalEarnings || 0)}</strong>
          <small>Base + Distance + Tips</small>
        </article>
        <article>
          <span className="driver-stat-title-flex">
            <Clock size={14} color="#6366f1" /> Active Duration
          </span>
          <strong>{analytics.onlineHours || 0} hrs</strong>
          <small>{analytics.idleHours || 0} hrs idle time</small>
        </article>
        <article>
          <span className="driver-stat-title-flex">
            <Award size={14} color="#10b981" /> Performance
          </span>
          <div className="driver-stat-ops-flex">
            <div>
              <div className="driver-ops-number">{analytics.completionRate}%</div>
              <div className="driver-ops-label">Completion</div>
            </div>
            <div className="driver-ops-divider">
              <div className="driver-ops-number">{analytics.acceptanceRate}%</div>
              <div className="driver-ops-label">Acceptance</div>
            </div>
          </div>
        </article>
      </section>

      {/* Bottom info section: Notifications & Safety emergency */}
      <div className="driver-workspace__grid driver-profile-grid-bottom-margin">
        {/* Notifications */}
        <section className="driver-panel driver-dashboard-panel-padding">
          <div className="driver-panel__heading driver-profile-panel-heading-margin">
            <div className="driver-dashboard-flex-align">
              <Bell size={18} color="var(--accent-orange)" />
              <h2 className="driver-quest-title">Alerts & Notifications</h2>
            </div>
          </div>
          <div className="driver-dashboard-notifications-list">
            <div className="driver-dashboard-alert-blue">
              <strong>Peak Hours Surge Boost active</strong>
              <p className="driver-dashboard-alert-desc">₹30.00 extra payout per delivery completed in Koramangala zone.</p>
            </div>
            <div className="driver-dashboard-alert-green">
              <strong>Fintech wallet auto-settlement complete</strong>
              <p className="driver-dashboard-alert-desc">All cleared earnings have been successfully moved to your available ledger wallet.</p>
            </div>
          </div>
        </section>

        {/* Safety & Compliance */}
        <section className="driver-panel driver-dashboard-panel-padding">
          <div className="driver-panel__heading driver-profile-panel-heading-margin">
            <div className="driver-dashboard-flex-align">
              <ShieldAlert size={18} color="#ef4444" />
              <h2 className="driver-quest-title">Safety & Compliance Center</h2>
            </div>
          </div>
          <div className="driver-dashboard-alert-desc">
            <p className="driver-profile-grid-margin">Ensure your smartphone is securely mounted in the vehicle and you wear your helmet during all shifts.</p>
            <div>
              <button
                className="driver-secondary-button driver-dashboard-sos-btn"
                onClick={() => alert("SOS Triggered! Dispatching emergency contacts...")}
              >
                SOS Emergency Assistance
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};
