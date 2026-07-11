import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Store,
  Users,
  Briefcase,
  Bike,
  ShoppingBag,
  Image,
  Receipt,
  Settings,
  FileText,
  LogOut,
  LogIn,
  Menu,
  X,
  Compass,
  MapPin,
  Wallet,
  ClipboardList,
} from "lucide-react";

/* ──────────────────────────────────────────────────────────
   AppSidebar — Unified sidebar for every role.
   Accepts role-specific nav config and renders a single,
   consistent design across admin, customer, restaurant,
   and delivery partner views.
   ────────────────────────────────────────────────────────── */

interface NavItem {
  path: string;
  label: string;
  icon: React.FC<{ size?: number }>;
  /** Optional click handler instead of navigation */
  onClick?: () => void;
}

interface NavGroup {
  label: string;
  items: NavItem[];
}

export interface AppSidebarProps {
  /** Display name shown in the user card */
  userName?: string | null;
  /** Role determines nav items when navGroups is not provided */
  role?:
    | "admin"
    | "restaurant_owner"
    | "delivery_partner"
    | "customer"
    | string
    | null;
  /** Override default nav groups (fully custom) */
  navGroups?: NavGroup[];
  /** Wallet balance for customer role */
  walletBalance?: number | null;
  /** Called when user clicks "Sign Out" */
  onLogout?: () => void;
  /** Called when wallet row is clicked (customer) */
  onDepositClick?: () => void;
  /** Whether the user is logged in */
  isLoggedIn?: boolean;
}

/* ─── Default nav groups per role ─── */
const adminGroups: NavGroup[] = [
  {
    label: "Control Room",
    items: [
      { path: "/", label: "Dashboard", icon: LayoutDashboard },
      { path: "/settings", label: "System Config", icon: Settings },
      { path: "/cms", label: "CMS Pages", icon: FileText },
    ],
  },
  {
    label: "Operations",
    items: [
      { path: "/restaurants", label: "Stores", icon: Store },
      { path: "/orders", label: "Orders", icon: ShoppingBag },
      { path: "/refunds", label: "Refunds", icon: Receipt },
    ],
  },
  {
    label: "People & Partners",
    items: [
      { path: "/owners", label: "Owners", icon: Briefcase },
      { path: "/customers", label: "Customers", icon: Users },
      { path: "/drivers", label: "Drivers", icon: Bike },
    ],
  },
  {
    label: "Assets",
    items: [{ path: "/images", label: "Image Library", icon: Image }],
  },
];

const restaurantGroups: NavGroup[] = [
  {
    label: "Merchant Console",
    items: [
      { path: "/", label: "Dashboard", icon: LayoutDashboard },
      { path: "/menu", label: "Menu Manager", icon: FileText },
      { path: "/earnings", label: "Earnings", icon: Receipt },
    ],
  },
];

const deliveryGroups: NavGroup[] = [
  {
    label: "Rider Console",
    items: [{ path: "/", label: "Active Jobs", icon: Bike }],
  },
];

const getCustomerGroups = (
  isLoggedIn: boolean,
  walletBalance: number | null,
  onDepositClick?: () => void,
): NavGroup[] => {
  const browseGroup: NavGroup = {
    label: "Browse",
    items: [{ path: "/", label: "Explore Stores", icon: Compass }],
  };

  if (!isLoggedIn) return [browseGroup];

  return [
    browseGroup,
    {
      label: "My Account",
      items: [
        { path: "/orders", label: "My Orders", icon: ClipboardList },
        { path: "/addresses", label: "Addresses", icon: MapPin },
        {
          path: "#",
          label: `Wallet: $${walletBalance !== null && walletBalance !== undefined ? walletBalance.toFixed(2) : "0.00"}`,
          icon: Wallet,
          onClick: onDepositClick,
        },
      ],
    },
  ];
};

/* ─── Badge label per role ─── */
const getBadge = (role: string | null | undefined): string => {
  if (role === "restaurant_owner") return "merchant";
  if (role === "delivery_partner") return "rider";
  if (role === "customer" || !role) return "bites";
  return "admin";
};

/* ─── Component ─── */
export const AppSidebar: React.FC<AppSidebarProps> = ({
  userName = "User",
  role = "customer",
  navGroups: customNavGroups,
  walletBalance = null,
  onLogout,
  onDepositClick,
  isLoggedIn = true,
}) => {
  const location = useLocation();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(() => {
    return localStorage.getItem("app_sidebar_collapsed") === "true";
  });

  React.useEffect(() => {
    const handleOpenSidebar = () => setIsMobileOpen(true);
    window.addEventListener("open-app-sidebar", handleOpenSidebar);
    return () =>
      window.removeEventListener("open-app-sidebar", handleOpenSidebar);
  }, []);

  const toggleCollapse = () => {
    setIsCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem("app_sidebar_collapsed", String(next));
      return next;
    });
  };

  const isActive = (path: string) => {
    if (path === "/" && location.pathname !== "/") return false;
    return location.pathname.startsWith(path);
  };

  /* Resolve nav groups */
  const navGroups =
    customNavGroups ??
    (role === "admin"
      ? adminGroups
      : role === "restaurant_owner"
        ? restaurantGroups
        : role === "delivery_partner"
          ? deliveryGroups
          : getCustomerGroups(isLoggedIn, walletBalance, onDepositClick));

  const badgeLabel = getBadge(role);
  const showUserCard = isLoggedIn;

  return (
    <>
      {/* Mobile Top Bar (Hidden for Customers, handled by Navbar) */}
      {role !== "customer" && (
        <div className="mobile-menu-bar">
          <Link
            to="/"
            className="admin-sidebar-logo"
            style={{ fontSize: "1.4rem" }}
          >
            bites<span>{badgeLabel}</span>
          </Link>
          <button
            onClick={() => setIsMobileOpen(!isMobileOpen)}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "#1e293b",
            }}
          >
            {isMobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      )}

      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          onClick={() => setIsMobileOpen(false)}
          className="drawer-backdrop"
          style={{ position: "fixed", zIndex: 95 }}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`admin-sidebar ${isMobileOpen ? "open" : ""} ${isCollapsed ? "collapsed" : ""}`}
      >
        <div>
          {/* Logo */}
          <div
            className="admin-sidebar-header"
            style={{ padding: isCollapsed ? "28px 16px" : "28px 24px" }}
          >
            {!isCollapsed ? (
              <Link to="/" className="admin-sidebar-logo">
                bites<span>{badgeLabel}</span>
              </Link>
            ) : (
              <Link
                to="/"
                className="admin-sidebar-logo"
                style={{ fontSize: "1.2rem" }}
              >
                b.
              </Link>
            )}
            <button
              onClick={toggleCollapse}
              className="navbar-desktop-only"
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                color: "#64748b",
                padding: "4px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
              title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
            >
              <Menu size={18} />
            </button>
          </div>

          {/* User Card (admin / restaurant / delivery) */}
          {showUserCard && (
            <div
              className="admin-sidebar-user"
              style={{ padding: isCollapsed ? "12px" : "16px 20px" }}
            >
              <div className="admin-avatar">
                {userName ? userName.charAt(0).toUpperCase() : "U"}
              </div>
              {!isCollapsed && (
                <div className="admin-user-info">
                  <span className="admin-user-name">{userName || "User"}</span>
                  <span className="admin-user-role">
                    <span className="admin-status-dot" /> Active Console
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Navigation */}
          <nav
            className="admin-sidebar-nav"
            style={{ padding: isCollapsed ? "12px" : "16px" }}
          >
            {navGroups.map((group, groupIdx) => (
              <div key={groupIdx} className="admin-nav-group">
                {!isCollapsed && (
                  <span className="admin-nav-label">{group.label}</span>
                )}
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item.path);

                  if (item.onClick) {
                    return (
                      <button
                        key={item.path + item.label}
                        onClick={() => {
                          item.onClick?.();
                          setIsMobileOpen(false);
                        }}
                        className={`admin-nav-item ${active ? "active" : ""}`}
                        title={isCollapsed ? item.label : ""}
                        style={{
                          justifyContent: isCollapsed ? "center" : "flex-start",
                          padding: isCollapsed ? "12px" : "12px 14px",
                          width: "100%",
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                          textAlign: "left",
                          font: "inherit",
                        }}
                      >
                        <Icon size={18} />
                        {!isCollapsed && <span>{item.label}</span>}
                      </button>
                    );
                  }

                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setIsMobileOpen(false)}
                      className={`admin-nav-item ${active ? "active" : ""}`}
                      title={isCollapsed ? item.label : ""}
                      style={{
                        justifyContent: isCollapsed ? "center" : "flex-start",
                        padding: isCollapsed ? "12px" : "12px 14px",
                      }}
                    >
                      <Icon size={18} />
                      {!isCollapsed && <span>{item.label}</span>}
                    </Link>
                  );
                })}
              </div>
            ))}
          </nav>
        </div>

        {/* Footer */}
        <div style={{ padding: "16px", borderTop: "1px solid #f0f4f8" }}>
          {isLoggedIn && onLogout ? (
            <button
              onClick={onLogout}
              className="admin-nav-item"
              title={isCollapsed ? "Sign Out" : ""}
              style={{
                width: "100%",
                background: "none",
                border: "none",
                cursor: "pointer",
                color: "#ef4444",
                justifyContent: isCollapsed ? "center" : "flex-start",
                padding: isCollapsed ? "12px" : "12px 14px",
              }}
            >
              <LogOut size={18} />
              {!isCollapsed && <span>Sign Out</span>}
            </button>
          ) : !isLoggedIn ? (
            <Link
              to="/login"
              className="admin-nav-item"
              title={isCollapsed ? "Sign In" : ""}
              style={{
                justifyContent: isCollapsed ? "center" : "flex-start",
                padding: isCollapsed ? "12px" : "12px 14px",
                color: "var(--accent-orange)",
              }}
            >
              <LogIn size={18} />
              {!isCollapsed && <span>Sign In</span>}
            </Link>
          ) : null}
        </div>
      </aside>
    </>
  );
};
