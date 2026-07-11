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
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({
  adminName = "System Admin",
  onLogout,
}) => {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  const isActive = (path: string) => {
    if (path === "/" && location.pathname !== "/") return false;
    return location.pathname.startsWith(path);
  };

  const navGroups = [
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

  return (
    <>
      {/* Mobile Top Navigation Bar */}
      <div className="mobile-menu-bar">
        <Link
          to="/"
          className="admin-sidebar-logo"
          style={{ fontSize: "1.4rem" }}
        >
          bites.<span>admin</span>
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
      <aside className={`admin-sidebar ${isOpen ? "open" : ""}`}>
        <div>
          {/* Logo Section */}
          <div className="admin-sidebar-header">
            <Link to="/" className="admin-sidebar-logo">
              bites.<span>admin</span>
            </Link>
          </div>

          {/* User Profile Card */}
          <div className="admin-sidebar-user">
            <div className="admin-avatar">
              {adminName ? adminName.charAt(0).toUpperCase() : "A"}
            </div>
            <div className="admin-user-info">
              <span className="admin-user-name">{adminName || "Admin"}</span>
              <span className="admin-user-role">
                <span className="admin-status-dot" /> Active Console
              </span>
            </div>
          </div>

          {/* Navigation Links Grouped */}
          <nav className="admin-sidebar-nav">
            {navGroups.map((group, groupIdx) => (
              <div key={groupIdx} className="admin-nav-group">
                <span className="admin-nav-label">{group.label}</span>
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item.path);
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setIsOpen(false)}
                      className={`admin-nav-item ${active ? "active" : ""}`}
                    >
                      <Icon size={18} />
                      <span>{item.label}</span>
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
              style={{
                width: "100%",
                background: "none",
                border: "none",
                cursor: "pointer",
                textAlign: "left",
                color: "#ef4444",
              }}
            >
              <LogOut size={18} />
              <span>Sign Out</span>
            </button>
          )}
        </div>
      </aside>
    </>
  );
};
