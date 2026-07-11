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
  Menu,
  X,
  Shield,
} from "lucide-react";

interface AdminSidebarProps {
  adminName?: string | null;
  onLogout?: () => void;
  role?: string | null; // dynamic role support: admin, restaurant_owner, delivery_partner
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({
  adminName = "System User",
  onLogout,
  role = "admin",
}) => {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(() => {
    return localStorage.getItem("admin_sidebar_collapsed") === "true";
  });

  const toggleCollapse = () => {
    setIsCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem("admin_sidebar_collapsed", String(next));
      return next;
    });
  };

  const isActive = (path: string) => {
    if (path === "/" && location.pathname !== "/") return false;
    return location.pathname.startsWith(path);
  };

  // Dynamically compute links based on role
  const getNavGroups = () => {
    if (role === "restaurant_owner") {
      return [
        {
          label: "Merchant Console",
          items: [
            { path: "/", label: "Dashboard", icon: LayoutDashboard },
            { path: "/menu", label: "Menu Manager", icon: FileText },
            { path: "/earnings", label: "Earnings", icon: Receipt },
          ],
        },
      ];
    }

    if (role === "delivery_partner") {
      return [
        {
          label: "Rider Console",
          items: [{ path: "/", label: "Active Jobs", icon: Bike }],
        },
      ];
    }

    // Default admin groups
    return [
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
  };

  const getBadgeLabel = () => {
    if (role === "restaurant_owner") return "merchant";
    if (role === "delivery_partner") return "rider";
    return "admin";
  };

  const navGroups = getNavGroups();
  const badgeLabel = getBadgeLabel();

  return (
    <>
      {/* Mobile Top Navigation Bar */}
      <div className="mobile-menu-bar">
        <Link
          to="/"
          className="admin-sidebar-logo"
          style={{ fontSize: "1.4rem" }}
        >
          bites.<span>{badgeLabel}</span>
        </Link>
        <button
          onClick={() => setIsOpen(!isOpen)}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            color: "#1e293b",
          }}
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Sidebar Overlay for Mobile */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="drawer-backdrop"
          style={{ position: "fixed", zIndex: 95 }}
        />
      )}

      {/* Main Sidebar */}
      <aside
        className={`admin-sidebar ${isOpen ? "open" : ""} ${isCollapsed ? "collapsed" : ""}`}
      >
        <div>
          {/* Logo Section */}
          <div
            className="admin-sidebar-header"
            style={{ padding: isCollapsed ? "28px 16px" : "28px 24px" }}
          >
            {!isCollapsed ? (
              <Link to="/" className="admin-sidebar-logo">
                bites.<span>{badgeLabel}</span>
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

          {/* User Profile Card */}
          <div
            className="admin-sidebar-user"
            style={{ padding: isCollapsed ? "12px" : "16px 20px" }}
          >
            <div className="admin-avatar">
              {adminName ? adminName.charAt(0).toUpperCase() : "A"}
            </div>
            {!isCollapsed && (
              <div className="admin-user-info">
                <span className="admin-user-name">{adminName || "Admin"}</span>
                <span className="admin-user-role">
                  <span className="admin-status-dot" /> Active Console
                </span>
              </div>
            )}
          </div>

          {/* Navigation Links Grouped */}
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
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setIsOpen(false)}
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

        {/* Footer Actions */}
        <div style={{ padding: "16px", borderTop: "1px solid #f0f4f8" }}>
          {onLogout && (
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
          )}
        </div>
      </aside>
    </>
  );
};
