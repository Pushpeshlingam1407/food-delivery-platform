import React, { useEffect, useState } from "react";
import { Shield, HelpCircle, LogOut, ShoppingBag, Store } from "lucide-react";
import api from "../../../shared/services/api";
import { useAppContext } from "../../../shared/context/AppContext";

export const ProfilePage: React.FC = () => {
  const { handleLogout } = useAppContext();
  const [driver, setDriver] = useState<any | null>(null);
  const [analytics, setAnalytics] = useState<any>({
    completionRate: 100,
    acceptanceRate: 95,
  });

  useEffect(() => {
    api
      .get("/auth/me")
      .then((res) => {
        if (res.data.status === "success" && res.data.data) {
          setDriver(res.data.data);
        }
      })
      .catch(console.error);

    api
      .get("/delivery/earnings/analytics")
      .then((res) => {
        if (res.data.status === "success" && res.data.data) {
          setAnalytics(res.data.data);
        }
      })
      .catch(console.error);
  }, []);

  const driverName =
    driver?.name || localStorage.getItem("userName") || "Driver";
  const driverEmail = driver?.email || "driver@bites.logistics.com";
  const driverId = driver?.id || "DRV-9018482";

  return (
    <div className="app-shell driver-workspace">
      <header className="driver-workspace__header">
        <div>
          <p className="driver-workspace__eyebrow">Rider Console</p>
          <h1>Profile & Console Settings</h1>
          <p>
            Manage your account, registered vehicle details, and platform
            support channels.
          </p>
        </div>
      </header>

      {/* Profile Overview Card */}
      <section className="driver-panel driver-profile-overview-card">
        <div className="driver-profile-flex-wrapper">
          <div className="delivery-sidebar__avatar driver-profile-avatar-large">
            {driverName.charAt(0).toUpperCase()}
          </div>
          <div>
            <h2 className="driver-profile-name">{driverName}</h2>
            <p className="driver-profile-meta-line">
              Partner ID: {driverId.slice(0, 10).toUpperCase()}
            </p>
            <p className="driver-profile-meta-subline">
              Registered Email: {driverEmail}
            </p>
          </div>
        </div>
      </section>

      {/* Vehicle details & Operations stats */}
      <div className="driver-workspace__grid driver-profile-grid-margin">
        {/* Vehicle specs */}
        <section className="driver-panel driver-profile-panel-padded">
          <div className="driver-panel__heading driver-profile-panel-heading-margin">
            <div>
              <p>Equipment info</p>
              <h2 className="driver-quest-title">Vehicle Specification</h2>
            </div>
          </div>
          <div className="driver-profile-details-grid">
            <div>
              <strong className="driver-profile-bold-label">
                Vehicle Type:
              </strong>{" "}
              Electric Two-Wheeler (EV)
            </div>
            <div>
              <strong className="driver-profile-bold-label">
                License Plate:
              </strong>{" "}
              KA-03-EM-8821
            </div>
            <div>
              <strong className="driver-profile-bold-label">
                Compliance Verification:
              </strong>{" "}
              Verified Active
            </div>
            <div>
              <strong className="driver-profile-bold-label">
                Insurance Validity:
              </strong>{" "}
              Valid until Dec 2026
            </div>
          </div>
        </section>

        {/* Quality metrics */}
        <section className="driver-panel driver-profile-panel-padded">
          <div className="driver-panel__heading driver-profile-panel-heading-margin">
            <div>
              <p>Shift metrics</p>
              <h2 className="driver-quest-title">Operational Quality</h2>
            </div>
          </div>
          <div className="driver-profile-details-grid">
            <div>
              <strong className="driver-profile-bold-label">
                Acceptance Rate:
              </strong>{" "}
              {analytics.acceptanceRate || 95}%
            </div>
            <div>
              <strong className="driver-profile-bold-label">
                Completion Rate:
              </strong>{" "}
              {analytics.completionRate || 100}%
            </div>
            <div>
              <strong className="driver-profile-bold-label">
                Platform Rating:
              </strong>{" "}
              4.9 ★ (Top Rated)
            </div>
            <div>
              <strong className="driver-profile-bold-label">
                Weekly Compliance:
              </strong>{" "}
              100% Status Good
            </div>
          </div>
        </section>
      </div>

      {/* Support & Quick Switch Portals */}
      <div className="driver-workspace__grid driver-profile-grid-bottom-margin">
        {/* Support Options */}
        <section className="driver-panel driver-profile-panel-padded">
          <div className="driver-panel__heading driver-profile-panel-heading-margin">
            <div>
              <p>Driver Assistance</p>
              <h2 className="driver-quest-title">Help Desk Support</h2>
            </div>
          </div>
          <div className="driver-profile-button-list">
            <button
              className="driver-secondary-button driver-profile-assistance-btn"
              onClick={() => alert("Connecting with safety desk...")}
            >
              <Shield size={16} color="#ef4444" />
              <span>Shift Safety Emergency Desk</span>
            </button>
            <button
              className="driver-secondary-button driver-profile-assistance-btn"
              onClick={() => alert("Opening payment dispute form...")}
            >
              <HelpCircle size={16} />
              <span>Payment & Ledger Help</span>
            </button>
            <button
              className="driver-secondary-button driver-profile-assistance-btn"
              onClick={handleLogout}
            >
              <LogOut size={16} color="#ef4444" />
              <span className="driver-profile-logout-text">
                Sign Out from shift console
              </span>
            </button>
          </div>
        </section>

        {/* Development Switching Console */}
        <section className="driver-panel driver-profile-panel-padded">
          <div className="driver-panel__heading driver-profile-panel-heading-margin">
            <div>
              <p>Development shortcuts</p>
              <h2 className="driver-quest-title">Portal Switching</h2>
            </div>
          </div>
          <div className="driver-profile-button-list">
            <a
              className="driver-secondary-button driver-profile-assistance-btn"
              href="http://localhost:5173"
              target="_blank"
              rel="noreferrer"
            >
              <ShoppingBag size={16} />
              <span>Customer Storefront Portal</span>
            </a>
            <a
              className="driver-secondary-button driver-profile-assistance-btn"
              href="http://localhost:5174"
              target="_blank"
              rel="noreferrer"
            >
              <Store size={16} />
              <span>Restaurant Merchant Dashboard</span>
            </a>
            <a
              className="driver-secondary-button driver-profile-assistance-btn"
              href="http://localhost:5175"
              target="_blank"
              rel="noreferrer"
            >
              <Shield size={16} />
              <span>System Admin Console</span>
            </a>
          </div>
        </section>
      </div>
    </div>
  );
};
