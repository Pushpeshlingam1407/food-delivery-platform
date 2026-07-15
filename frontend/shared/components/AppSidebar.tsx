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
import "./AppSidebar.css";
import { useAppContext } from "../context/AppContext";

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
          label: `Wallet: ₹${walletBalance !== null && walletBalance !== undefined ? walletBalance.toFixed(2) : "0.00"}`,
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
  userName,
  role,
  navGroups: customNavGroups,
  walletBalance = null,
  onLogout,
  onDepositClick,
  isLoggedIn,
}) => {
  const context = useAppContext();

  // Resolve properties using props or fallback to context
  const resolvedIsLoggedIn =
    isLoggedIn !== undefined ? isLoggedIn : !!context?.userEmail;
  const resolvedRole = role || context?.userRole || "customer";
  const resolvedUserName =
    userName ||
    (context?.userEmail
      ? localStorage.getItem("userName") || context.userEmail
      : null);
  const resolvedWalletBalance =
    walletBalance !== null
      ? walletBalance
      : context?.walletBalance !== undefined
        ? context?.walletBalance
        : 0;
  const resolvedOnLogout = onLogout || context?.handleLogout;
  const resolvedOnDepositClick = onDepositClick || context?.handleDeposit;

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
    (resolvedRole === "admin"
      ? adminGroups
      : resolvedRole === "restaurant_owner"
        ? restaurantGroups
        : resolvedRole === "delivery_partner"
          ? deliveryGroups
          : getCustomerGroups(
              resolvedIsLoggedIn,
              resolvedWalletBalance,
              resolvedOnDepositClick,
            ));

  const badgeLabel = getBadge(resolvedRole);
  const showUserCard = resolvedIsLoggedIn;

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <button
          type="button"
          aria-label="Close navigation drawer"
          onClick={() => setIsMobileOpen(false)}
          className="drawer-backdrop app-sidebar-fixed"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`admin-sidebar ${isMobileOpen ? "open" : ""} ${isCollapsed ? "collapsed" : ""}`}
      >
        <div>
          {/* Logo */}
          <div
            className={`admin-sidebar-header ${isCollapsed ? "app-sidebar-header-wrapper-collapsed" : "app-sidebar-header-wrapper-expanded"}`}
          >
            {!isCollapsed ? (
              <Link
                to="/"
                className="admin-sidebar-logo"
                style={{
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                  fontWeight: 900,
                }}
              >
                {resolvedRole === "admin"
                  ? "Bites Admin"
                  : resolvedRole === "restaurant_owner"
                    ? "Bites Merchant"
                    : resolvedRole === "delivery_partner"
                      ? "Bites Logistics"
                      : "bites"}
              </Link>
            ) : (
              <Link to="/" className="admin-sidebar-logo app-sidebar-logo-text">
                b.
              </Link>
            )}
            <button
              onClick={toggleCollapse}
              className="navbar-desktop-only"
              title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
            >
              <Menu size={18} />
            </button>
          </div>

          {/* User Card (admin / restaurant / delivery) */}
          {showUserCard && (
            <div
              className={`admin-sidebar-user ${isCollapsed ? "app-sidebar-user-card-collapsed" : "app-sidebar-user-card-expanded"}`}
            >
              <div className="admin-avatar">
                {resolvedUserName
                  ? resolvedUserName.charAt(0).toUpperCase()
                  : "U"}
              </div>
              {!isCollapsed && (
                <div className="admin-user-info">
                  <span className="admin-user-name">
                    {resolvedUserName || "User"}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Navigation */}
          <nav className="admin-sidebar-nav">
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
                        className={`admin-nav-item ${active ? "active" : ""} ${isCollapsed ? "app-sidebar-nav-item-collapsed" : "app-sidebar-nav-item-expanded"}`}
                        title={isCollapsed ? item.label : ""}
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
                      className={`admin-nav-item ${active ? "active" : ""} ${isCollapsed ? "app-sidebar-nav-item-collapsed" : "app-sidebar-nav-item-expanded"}`}
                      title={isCollapsed ? item.label : ""}
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
        <div className="app-sidebar-footer-container">
          {resolvedIsLoggedIn && resolvedOnLogout ? (
            <button
              onClick={resolvedOnLogout}
              className={`admin-nav-item app-sidebar-signout-btn ${isCollapsed ? "app-sidebar-nav-item-collapsed" : "app-sidebar-nav-item-expanded"}`}
              title={isCollapsed ? "Sign Out" : ""}
            >
              <LogOut size={18} />
              {!isCollapsed && <span>Sign Out</span>}
            </button>
          ) : !resolvedIsLoggedIn ? (
            <Link
              to="/login"
              className={`admin-nav-item app-sidebar-signin-link ${isCollapsed ? "app-sidebar-nav-item-collapsed" : "app-sidebar-nav-item-expanded"}`}
              title={isCollapsed ? "Sign In" : ""}
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
