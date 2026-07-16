import React from "react";
import { Link, useLocation } from "react-router-dom";
import { ToggleLeft, ToggleRight, Truck, X } from "lucide-react";
import { BitesNavbar } from "../../../shared/components/BitesNavbar";
import { useDelivery } from "../hooks/useDelivery";
import { deliveryNavigation } from "./deliveryNavigation";

export const Navbar: React.FC = () => {
  const { driverName, isOnline, logout } = useDelivery();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = React.useState(false);

  const isActive = (path: string) =>
    path === "/" ? location.pathname === "/" : location.pathname.startsWith(path);

  return (
    <>
      <BitesNavbar
        variant="driver"
        driverName={driverName}
        onLogout={logout}
        onOpenMenu={() => setMenuOpen(true)}
      />

      {menuOpen && (
        <button
          type="button"
          className="drawer-backdrop"
          aria-label="Close navigation"
          onClick={() => setMenuOpen(false)}
        />
      )}
      {menuOpen && (
        <aside className="mobile-drawer mobile-drawer--left">
          <div className="drawer-header">
            <strong className="delivery-navbar__brand">bites</strong>
            <button
              type="button"
              className="drawer-close-button"
              aria-label="Close navigation"
              onClick={() => setMenuOpen(false)}
            >
              <X size={20} />
            </button>
          </div>
          <div className="delivery-navbar__drawer-content delivery-navbar__drawer-content--navigation">
            <div>
              <Truck size={18} />
              <span>{driverName}</span>
            </div>
            <span className="delivery-navbar__drawer-status">
              {isOnline ? <ToggleRight size={18} /> : <ToggleLeft size={18} />}
              {isOnline ? "Online" : "Offline"}
            </span>
            {deliveryNavigation.map((section) => (
              <div className="delivery-navbar__drawer-section" key={section.label}>
                <span className="delivery-navbar__drawer-title">{section.label}</span>
                {section.items.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      className={isActive(item.path) ? "active" : ""}
                      key={item.label}
                      to={item.path}
                      onClick={() => setMenuOpen(false)}
                    >
                      <Icon size={18} />
                      {item.label}
                    </Link>
                  );
                })}
              </div>
            ))}
            <button type="button" onClick={logout}>Sign out</button>
          </div>
        </aside>
      )}
    </>
  );
};
