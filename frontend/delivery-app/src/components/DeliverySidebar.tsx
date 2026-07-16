import React from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Wallet,
  ClipboardList,
  LayoutDashboard,
  LogOut,
  FileText,
  ShoppingBag,
  Store,
  Shield,
  Truck,
  User,
  Map,
  MessageSquare,
  Bell,
  Settings as SettingsIcon,
  HelpCircle,
  ToggleLeft,
  ToggleRight,
  PanelLeftClose,
  PanelLeftOpen,
  Bike,
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

      {/* OPERATIONS SECTION */}
      <div className="delivery-sidebar__section-title">
        {!collapsed ? "Operations" : "OPS"}
      </div>
      <nav className="delivery-sidebar__nav" aria-label="Operations navigation">
        <Link
          className={`delivery-sidebar__link ${isActive("/") ? "active" : ""}`}
          to="/"
        >
          <LayoutDashboard size={18} />
          {!collapsed && <span>Dashboard / Home</span>}
        </Link>
        <Link className="delivery-sidebar__link" to="/">
          {isOnline ? (
            <ToggleRight size={18} color="#10b981" />
          ) : (
            <ToggleLeft size={18} color="#64748b" />
          )}
          {!collapsed && (
            <span>Availability: {isOnline ? "Online" : "Offline"}</span>
          )}
        </Link>
        <Link
          className={`delivery-sidebar__link ${isActive("/requests") ? "active" : ""}`}
          to="/requests"
        >
          <Truck size={18} />
          {!collapsed && <span>Delivery Requests</span>}
        </Link>
        <Link
          className={`delivery-sidebar__link ${isActive("/active-orders") ? "active" : ""}`}
          to="/active-orders"
        >
          <Map size={18} />
          {!collapsed && <span>Active Orders</span>}
        </Link>
        <Link
          className={`delivery-sidebar__link ${isActive("/active-orders") ? "active" : ""}`}
          to="/active-orders"
        >
          <ClipboardList size={18} />
          {!collapsed && <span>Assigned Deliveries</span>}
        </Link>
        <Link
          className={`delivery-sidebar__link ${isActive("/active-orders") ? "active" : ""}`}
          to="/active-orders"
        >
          <Map size={18} />
          {!collapsed && <span>Route & Navigation</span>}
        </Link>
      </nav>

      {/* FINANCES & PERFORMANCE SECTION */}
      <div className="delivery-sidebar__section-title">
        {!collapsed ? "Finance & Stats" : "FIN"}
      </div>
      <nav className="delivery-sidebar__nav" aria-label="Finance navigation">
        <Link
          className={`delivery-sidebar__link ${isActive("/earnings") ? "active" : ""}`}
          to="/earnings"
        >
          <ClipboardList size={18} />
          {!collapsed && <span>Earnings & Payments</span>}
        </Link>
        <Link
          className={`delivery-sidebar__link ${isActive("/earnings") ? "active" : ""}`}
          to="/earnings"
        >
          <FileText size={18} />
          {!collapsed && <span>Performance Analytics</span>}
        </Link>
        <Link
          className={`delivery-sidebar__link ${isActive("/wallet") ? "active" : ""}`}
          to="/wallet"
        >
          <Wallet size={18} />
          {!collapsed && <span>Wallet</span>}
        </Link>
        <Link
          className={`delivery-sidebar__link ${isActive("/ledger") ? "active" : ""}`}
          to="/ledger"
        >
          <FileText size={18} />
          {!collapsed && <span>Delivery History</span>}
        </Link>
      </nav>

      {/* ACCOUNT & ASSISTANCE SECTION */}
      <div className="delivery-sidebar__section-title">
        {!collapsed ? "Support & Settings" : "SUP"}
      </div>
      <nav className="delivery-sidebar__nav" aria-label="Support navigation">
        <Link
          className={`delivery-sidebar__link ${isActive("/") ? "active" : ""}`}
          to="/"
        >
          <Bell size={18} />
          {!collapsed && <span>Notifications</span>}
        </Link>
        <Link
          className={`delivery-sidebar__link ${isActive("/active-orders") ? "active" : ""}`}
          to="/active-orders"
        >
          <MessageSquare size={18} />
          {!collapsed && <span>Customer Communication</span>}
        </Link>
        <Link
          className={`delivery-sidebar__link ${isActive("/profile") ? "active" : ""}`}
          to="/profile"
        >
          <User size={18} />
          {!collapsed && <span>Profile & Vehicle Details</span>}
        </Link>
        <Link
          className={`delivery-sidebar__link ${isActive("/profile") ? "active" : ""}`}
          to="/profile"
        >
          <SettingsIcon size={18} />
          {!collapsed && <span>Settings</span>}
        </Link>
        <Link
          className={`delivery-sidebar__link ${isActive("/profile") ? "active" : ""}`}
          to="/profile"
        >
          <HelpCircle size={18} />
          {!collapsed && <span>Support / Help Center</span>}
        </Link>
      </nav>

      {/* Switch Portals Section */}
      <div className="delivery-sidebar__section-title">
        {!collapsed ? "Switch Portals" : "•••"}
      </div>
      <nav className="delivery-sidebar__nav" aria-label="Platform portals">
        <a
          className="delivery-sidebar__link"
          href="http://localhost:5173"
          target="_blank"
          rel="noreferrer"
        >
          <ShoppingBag size={18} />
          {!collapsed && <span>Customer App</span>}
        </a>
        <a
          className="delivery-sidebar__link"
          href="http://localhost:5174"
          target="_blank"
          rel="noreferrer"
        >
          <Store size={18} />
          {!collapsed && <span>Restaurant App</span>}
        </a>
        <a
          className="delivery-sidebar__link"
          href="http://localhost:5175"
          target="_blank"
          rel="noreferrer"
        >
          <Shield size={18} />
          {!collapsed && <span>Admin Dashboard</span>}
        </a>
      </nav>

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
