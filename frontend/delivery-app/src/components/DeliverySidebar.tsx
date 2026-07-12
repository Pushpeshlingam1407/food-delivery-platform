import React from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Bike,
  Wallet,
  ClipboardList,
  LayoutDashboard,
  LogOut,
  Sparkles,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";

interface DeliverySidebarProps {
  driverName?: string | null;
  isOnline?: boolean;
  onLogout?: () => void;
  onWalletJump?: () => void;
  onJobsJump?: () => void;
  collapsed?: boolean;
  onToggleCollapsed?: () => void;
}

export const DeliverySidebar: React.FC<DeliverySidebarProps> = ({
  driverName = "Driver",
  isOnline = false,
  onLogout,
  onWalletJump,
  onJobsJump,
  collapsed = false,
  onToggleCollapsed,
}) => {
  const location = useLocation();

  const isActive = (path: string) => {
    if (path === "/") return location.pathname === "/";
    return location.pathname.startsWith(path);
  };

  return (
    <aside className={`delivery-sidebar ${collapsed ? "is-collapsed" : ""}`}>
      <div className="delivery-sidebar__top">
        <Link to="/" className="delivery-sidebar__brand">
          {collapsed ? "b" : "bites"}
        </Link>
        <span
          className={`delivery-sidebar__status ${isOnline ? "is-live" : "is-offline"}`}
        >
          {isOnline ? "On shift" : "Offline"}
        </span>
        {onToggleCollapsed && (
          <button
            type="button"
            className="delivery-sidebar__toggle"
            onClick={onToggleCollapsed}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? (
              <PanelLeftOpen size={18} />
            ) : (
              <PanelLeftClose size={18} />
            )}
          </button>
        )}
      </div>

      <div className="delivery-sidebar__card">
        <div className="delivery-sidebar__avatar">
          {driverName ? driverName.charAt(0).toUpperCase() : "D"}
        </div>
        <div>
          {!collapsed && (
            <>
              <div className="delivery-sidebar__name">{driverName}</div>
              <div className="delivery-sidebar__meta">
                Delivery partner console
              </div>
            </>
          )}
        </div>
      </div>

      <nav className="delivery-sidebar__nav" aria-label="Delivery navigation">
        <Link
          className={`delivery-sidebar__link ${isActive("/") ? "active" : ""}`}
          to="/"
        >
          <LayoutDashboard size={18} />
          {!collapsed && <span>Shift overview</span>}
        </Link>
        <button
          className="delivery-sidebar__link"
          type="button"
          onClick={onJobsJump}
        >
          <ClipboardList size={18} />
          {!collapsed && <span>Job queue</span>}
        </button>
        <button
          className="delivery-sidebar__link"
          type="button"
          onClick={onWalletJump}
        >
          <Wallet size={18} />
          {!collapsed && <span>Wallet</span>}
        </button>
      </nav>

      {!collapsed && (
        <div className="delivery-sidebar__panel">
          <Sparkles size={16} />
          <div>
            <div className="delivery-sidebar__panel-title">Today’s flow</div>
            <div className="delivery-sidebar__panel-copy">
              Keep shift active, move the next handoff, and cash out when you
              are ready.
            </div>
          </div>
        </div>
      )}

      <div className="delivery-sidebar__footer">
        {onLogout && (
          <button
            className="delivery-sidebar__logout"
            type="button"
            onClick={onLogout}
          >
            <LogOut size={18} />
            {!collapsed && <span>Sign out</span>}
          </button>
        )}
        <div className="delivery-sidebar__note">
          <Bike size={14} />
          {!collapsed && <span>Live rider view</span>}
        </div>
      </div>
    </aside>
  );
};
