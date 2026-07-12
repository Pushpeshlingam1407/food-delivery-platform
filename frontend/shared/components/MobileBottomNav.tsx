import React from "react";
import { Link, useLocation } from "react-router-dom";

export interface MobileBottomNavItem {
  label: string;
  route?: string;
  onClick?: () => void;
  icon: React.ReactNode;
  badge?: number | string | null;
}

interface MobileBottomNavProps {
  items: MobileBottomNavItem[];
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({ items }) => {
  const location = useLocation();

  return (
    <nav className="mobile-bottom-nav" aria-label="Mobile navigation">
      {items.map((item) => {
        const isActive = item.route ? location.pathname === item.route : false;

        if (item.onClick) {
          return (
            <button
              key={item.label}
              type="button"
              className={`mobile-bottom-nav-item${isActive ? " active" : ""}`}
              onClick={item.onClick}
            >
              {item.badge != null && (
                <span className="mobile-bottom-nav-badge">{item.badge}</span>
              )}
              {item.icon}
              <span>{item.label}</span>
            </button>
          );
        }

        return (
          <Link
            key={item.label}
            to={item.route || "/"}
            className={`mobile-bottom-nav-item${isActive ? " active" : ""}`}
          >
            {item.badge != null && (
              <span className="mobile-bottom-nav-badge">{item.badge}</span>
            )}
            {item.icon}
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
};
