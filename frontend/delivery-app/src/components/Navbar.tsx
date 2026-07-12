import React from "react";
import { Link } from "react-router-dom";
import { Truck, X } from "lucide-react";
import { BitesNavbar } from "../../../shared/components/BitesNavbar";

interface NavbarProps {
  driverName?: string | null;
  onLogout?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  driverName = "Driver",
  onLogout,
}) => {
  const [menuOpen, setMenuOpen] = React.useState(false);

  return (
    <>
      <BitesNavbar variant="driver" driverName={driverName} onLogout={onLogout} onOpenMenu={() => setMenuOpen(true)} />

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
          <div className="delivery-navbar__drawer-content">
            <div>
              <Truck size={18} />
              <span>{driverName}</span>
            </div>
            <Link to="/" onClick={() => setMenuOpen(false)}>
              Delivery workspace
            </Link>
            {onLogout && (
              <button type="button" onClick={onLogout}>
                Sign out
              </button>
            )}
          </div>
        </aside>
      )}
    </>
  );
};
