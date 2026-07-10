import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  Compass,
  Truck,
  MapPin,
  Wallet,
  LogOut,
  LogIn,
  User,
  ShoppingBag,
  Menu,
} from "lucide-react";

interface DesktopSidebarProps {
  userEmail: string | null;
  userRole: string | null;
  onLogout: () => void;
  onDepositClick: () => void;
  walletBalance: number | null;
}

export const DesktopSidebar: React.FC<DesktopSidebarProps> = ({
  userEmail,
  userRole,
  onLogout,
  onDepositClick,
  walletBalance,
}) => {
  const [isCollapsed, setIsCollapsed] = useState(true);

  return (
    <div className={`desktop-sidebar ${isCollapsed ? "collapsed" : ""}`}>
      <div className="desktop-sidebar-header">
        {!isCollapsed && (
          <Link to="/" className="desktop-sidebar-logo">
            {userRole === "admin"
              ? "bites.admin"
              : userRole === "restaurant_owner"
                ? "bites.merchant"
                : userRole === "delivery_partner"
                  ? "bites.rider"
                  : "bites."}
          </Link>
        )}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="desktop-sidebar-toggle-btn"
          title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
        >
          <Menu size={18} />
        </button>
      </div>

      <nav className="desktop-sidebar-nav">
        {!userRole || userRole === "customer" ? (
          <>
            <Link to="/" className="desktop-sidebar-link">
              <span className="sidebar-emoji">🏪</span>
              <span>Explore Stores</span>
            </Link>
            {userEmail && (
              <>
                <Link to="/orders" className="desktop-sidebar-link">
                  <span className="sidebar-emoji">📦</span>
                  <span>My Orders</span>
                </Link>
                <Link to="/addresses" className="desktop-sidebar-link">
                  <span className="sidebar-emoji">📍</span>
                  <span>Addresses</span>
                </Link>
                <div
                  onClick={onDepositClick}
                  className="desktop-sidebar-link cursor-pointer"
                >
                  <span className="sidebar-emoji">💳</span>
                  <span>
                    Wallet: $
                    {walletBalance !== null ? walletBalance.toFixed(2) : "0.00"}
                  </span>
                </div>
              </>
            )}
          </>
        ) : userRole === "admin" ? (
          <>
            <Link to="/" className="desktop-sidebar-link">
              <span className="sidebar-emoji">📊</span>
              <span>Dashboard</span>
            </Link>
            <Link to="/restaurants" className="desktop-sidebar-link">
              <span className="sidebar-emoji">🍳</span>
              <span>Restaurants</span>
            </Link>
            <Link to="/customers" className="desktop-sidebar-link">
              <span className="sidebar-emoji">👥</span>
              <span>Customers</span>
            </Link>
            <Link to="/owners" className="desktop-sidebar-link">
              <span className="sidebar-emoji">💼</span>
              <span>Owners</span>
            </Link>
            <Link to="/drivers" className="desktop-sidebar-link">
              <span className="sidebar-emoji">🛵</span>
              <span>Drivers</span>
            </Link>
            <Link to="/orders" className="desktop-sidebar-link">
              <span className="sidebar-emoji">📝</span>
              <span>Orders</span>
            </Link>
            <Link to="/images" className="desktop-sidebar-link">
              <span className="sidebar-emoji">🖼️</span>
              <span>Images</span>
            </Link>
            <Link to="/refunds" className="desktop-sidebar-link">
              <span className="sidebar-emoji">💰</span>
              <span>Refunds</span>
            </Link>
            <Link to="/cms" className="desktop-sidebar-link">
              <span className="sidebar-emoji">📄</span>
              <span>CMS Pages</span>
            </Link>
            <Link to="/settings" className="desktop-sidebar-link">
              <span className="sidebar-emoji">⚙️</span>
              <span>Settings</span>
            </Link>
          </>
        ) : userRole === "restaurant_owner" ? (
          <>
            <Link to="/" className="desktop-sidebar-link">
              <span className="sidebar-emoji">📈</span>
              <span>Dashboard</span>
            </Link>
            <Link to="/menu" className="desktop-sidebar-link">
              <span className="sidebar-emoji">📋</span>
              <span>Menu Manager</span>
            </Link>
            <Link to="/earnings" className="desktop-sidebar-link">
              <span className="sidebar-emoji">💵</span>
              <span>Earnings</span>
            </Link>
          </>
        ) : userRole === "delivery_partner" ? (
          <>
            <Link to="/" className="desktop-sidebar-link">
              <span className="sidebar-emoji">🚀</span>
              <span>Active Jobs</span>
            </Link>
          </>
        ) : null}
      </nav>

      <div className="desktop-sidebar-footer">
        {userEmail ? (
          <button
            onClick={onLogout}
            className="desktop-sidebar-link desktop-sidebar-logout"
          >
            <span className="sidebar-emoji">🚪</span>
            <span>Sign Out</span>
          </button>
        ) : (
          <Link
            to="/login"
            className="desktop-sidebar-link desktop-sidebar-login"
          >
            <span className="sidebar-emoji">🔑</span>
            <span>Sign In</span>
          </Link>
        )}
      </div>
    </div>
  );
};
