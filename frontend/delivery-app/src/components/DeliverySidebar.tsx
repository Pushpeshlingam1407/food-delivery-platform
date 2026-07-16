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
  FileText,
  ShoppingBag,
  Store,
  Shield,
  Truck,
  User,
} from "lucide-react";

interface DeliverySidebarProps {
  driverName?: string | null;
  isOnline?: boolean;
  onLogout?: () => void;
  collapsed?: boolean;
  onToggleCollapsed?: () => void;
}

export const DeliverySidebar: React.FC<DeliverySidebarProps> = ({
  driverName = "Driver",
  isOnline = false,
  onLogout,
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
        <Link
          className={`delivery-sidebar__link ${isActive("/deliveries") ? "active" : ""}`}
          to="/deliveries"
        >
          <Truck size={18} />
          {!collapsed && <span>Deliveries</span>}
        </Link>
        <Link
          className={`delivery-sidebar__link ${isActive("/earnings") ? "active" : ""}`}
          to="/earnings"
        >
          <ClipboardList size={18} />
          {!collapsed && <span>Earnings</span>}
        </Link>
        <Link
          className={`delivery-sidebar__link ${isActive("/ledger") ? "active" : ""}`}
          to="/ledger"
        >
          <FileText size={18} />
          {!collapsed && <span>Ledger</span>}
        </Link>
        <Link
          className={`delivery-sidebar__link ${isActive("/wallet") ? "active" : ""}`}
          to="/wallet"
        >
          <Wallet size={18} />
          {!collapsed && <span>Wallet</span>}
        </Link>
        <Link
          className={`delivery-sidebar__link ${isActive("/profile") ? "active" : ""}`}
          to="/profile"
        >
          <User size={18} />
          {!collapsed && <span>Profile</span>}
        </Link>
      </nav>

      {/* Switch Portals Section */}
      <div className="delivery-sidebar__section-title">
        {!collapsed ? "Switch Portals" : "•••"}
      </div>
      <nav className="delivery-sidebar__nav" aria-label="Platform portals">
        <a className="delivery-sidebar__link" href="http://localhost:5173" target="_blank" rel="noreferrer">
          <ShoppingBag size={18} />
          {!collapsed && <span>Customer App</span>}
        </a>
        <a className="delivery-sidebar__link" href="http://localhost:5174" target="_blank" rel="noreferrer">
          <Store size={18} />
          {!collapsed && <span>Restaurant App</span>}
        </a>
        <a className="delivery-sidebar__link" href="http://localhost:5175" target="_blank" rel="noreferrer">
          <Shield size={18} />
          {!collapsed && <span>Admin Dashboard</span>}
        </a>
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
