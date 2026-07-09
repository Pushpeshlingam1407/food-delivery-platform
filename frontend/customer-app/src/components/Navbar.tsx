import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  ShoppingBag,
  User,
  Search,
  MapPin,
  Menu,
  X,
  Wallet,
} from "lucide-react";
import { SearchBar } from "../../../shared/components/SearchBar";

interface NavbarProps {
  cartCount?: number;
  userEmail?: string | null;
  onLogout?: () => void;
  onCartClick?: () => void;
  searchQuery?: string;
  onSearchChange?: (val: string) => void;
  walletBalance?: number | null;
  onDepositClick?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  cartCount = 0,
  userEmail = null,
  onLogout,
  onCartClick,
  searchQuery = "",
  onSearchChange,
  walletBalance = null,
  onDepositClick,
}) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [walletDropdownOpen, setWalletDropdownOpen] = useState(false);

  return (
    <>
      <nav className="navbar-container">
        {/* Top Header Row containing Brand and Actions */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%" }}>
          <div className="navbar-row">
            {/* Mobile Hamburger Menu Toggle */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="mobile-menu-toggle"
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                color: "var(--text-slate)",
                padding: "4px",
              }}
            >
              <Menu size={24} />
            </button>

            {/* Brand logo (Cohere style) */}
            <Link
              to="/"
              style={{
                fontFamily: "var(--font-cohere)",
                fontWeight: 800,
                fontSize: "1.6rem",
                background: "var(--primary-gradient)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                cursor: "pointer",
                textDecoration: "none",
              }}
            >
              bites.
            </Link>

            {/* Desktop Address Selector */}
            <div className="navbar-address-pill navbar-desktop-only" style={{ marginLeft: "16px" }}>
              <MapPin size={16} color="var(--accent-orange)" />
              <span style={{ color: "var(--text-slate)" }}>Deliver to:</span>
              <strong style={{ fontWeight: 600 }}>Bengaluru, IND</strong>
            </div>
          </div>

          {/* Desktop Search Input Bar */}
          <SearchBar
            className="navbar-desktop-only"
            placeholder="Search restaurants, cuisines..."
            value={searchQuery}
            onSearchChange={onSearchChange}
            containerStyle={{ width: "320px" }}
          />

          {/* Action items */}
          <div
            className="navbar-action-group"
            style={{ display: "flex", alignItems: "center", gap: "24px" }}
          >
            {walletBalance !== null && (
              <div style={{ position: "relative" }}>
                <div
                  onClick={() => setWalletDropdownOpen(!walletDropdownOpen)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    background: "rgba(235, 94, 40, 0.08)",
                    border: "1px solid rgba(235, 94, 40, 0.2)",
                    padding: "6px 12px",
                    borderRadius: "20px",
                    fontSize: "0.85rem",
                    fontWeight: 600,
                    color: "var(--accent-orange)",
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                  }}
                  title="View Wallet Details"
                >
                  <Wallet size={16} />
                  <span>${walletBalance.toFixed(2)}</span>
                </div>

                {walletDropdownOpen && (
                  <div
                    style={{
                      position: "absolute",
                      top: "36px",
                      right: 0,
                      width: "240px",
                      background: "#FFFFFF",
                      border: "1px solid var(--glass-border)",
                      borderRadius: "var(--radius-standard)",
                      boxShadow: "var(--glass-shadow)",
                      padding: "16px",
                      zIndex: 100,
                      display: "flex",
                      flexDirection: "column",
                      gap: "12px",
                    }}
                  >
                    <div
                      style={{
                        fontWeight: 700,
                        fontSize: "0.9rem",
                        color: "var(--text-slate)",
                      }}
                    >
                      Bites Wallet
                    </div>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                      }}
                    >
                      <span
                        style={{
                          fontSize: "0.85rem",
                          color: "var(--text-muted)",
                        }}
                      >
                        Balance:
                      </span>
                      <span
                        style={{
                          fontWeight: 800,
                          fontSize: "1.1rem",
                          color: "var(--accent-orange)",
                        }}
                      >
                        ${walletBalance.toFixed(2)}
                      </span>
                    </div>
                    <button
                      onClick={() => {
                        setWalletDropdownOpen(false);
                        onDepositClick && onDepositClick();
                      }}
                      className="btn-premium btn-sm"
                      style={{
                        width: "100%",
                        padding: "8px",
                        fontSize: "0.85rem",
                        fontWeight: 700,
                        cursor: "pointer",
                      }}
                    >
                      + Add Money
                    </button>
                  </div>
                )}
              </div>
            )}
            <div
              style={{ position: "relative", cursor: "pointer" }}
              onClick={onCartClick}
            >
              <ShoppingBag size={20} color="var(--text-slate)" />
              {cartCount > 0 && (
                <span
                  style={{
                    position: "absolute",
                    top: "-8px",
                    right: "-8px",
                    background: "var(--accent-orange)",
                    color: "var(--text-sand)",
                    fontSize: "0.75rem",
                    fontWeight: 700,
                    borderRadius: "50%",
                    width: "18px",
                    height: "18px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {cartCount}
                </span>
              )}
            </div>

            {userEmail ? (
              <div
                className="navbar-desktop-only"
                style={{ alignItems: "center", gap: "20px" }}
              >
                <Link
                  to="/orders"
                  style={{
                    textDecoration: "none",
                    color: "var(--text-slate)",
                    fontSize: "0.9rem",
                    fontWeight: 600,
                    fontFamily: "var(--font-cohere)",
                  }}
                >
                  My Orders
                </Link>
                <Link
                  to="/addresses"
                  style={{
                    textDecoration: "none",
                    color: "var(--text-slate)",
                    fontSize: "0.9rem",
                    fontWeight: 600,
                    fontFamily: "var(--font-cohere)",
                  }}
                >
                  Addresses
                </Link>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    cursor: "pointer",
                  }}
                >
                  <User size={20} color="var(--text-slate)" />
                  <span style={{ fontSize: "0.9rem", fontWeight: 500 }}>
                    {userEmail}
                  </span>
                </div>
                <button
                  onClick={onLogout}
                  style={{
                    background: "transparent",
                    border: "none",
                    color: "var(--accent-orange)",
                    fontWeight: 600,
                    fontSize: "0.9rem",
                    cursor: "pointer",
                  }}
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="navbar-desktop-only">
                <Link
                  to="/login"
                  className="btn-premium"
                  style={{
                    textDecoration: "none",
                    padding: "8px 20px",
                    fontSize: "0.9rem",
                  }}
                >
                  Sign In
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Address Pill and Search Bar (Visible on Mobile/Tablet only) */}
        <div className="navbar-mobile-only" style={{ flexDirection: "column", gap: "10px", width: "100%" }}>
          {/* Mobile Address Selector */}
          <div
            className="navbar-address-pill"
            style={{
              width: "100%",
              justifyContent: "flex-start",
              background: "transparent",
              padding: "4px 0",
              border: "none",
            }}
          >
            <MapPin size={16} color="var(--accent-orange)" />
            <span style={{ color: "var(--text-slate)", fontSize: "0.85rem" }}>Deliver to:</span>
            <strong style={{ fontWeight: 600, fontSize: "0.85rem" }}>Bengaluru, IND</strong>
          </div>

          {/* Mobile Search Input Bar */}
          <SearchBar
            placeholder="Search restaurants, cuisines..."
            value={searchQuery}
            onSearchChange={onSearchChange}
            containerStyle={{ padding: "10px 16px", width: "100%" }}
            style={{ fontSize: "0.95rem" }}
          />
        </div>
      </nav>

      {/* Mobile Drawer (3-lines Sidebar) */}
      {menuOpen && (
        <button
          type="button"
          aria-label="Close navigation drawer"
          className="drawer-backdrop"
          onClick={() => setMenuOpen(false)}
        />
      )}

      {menuOpen && (
        <div className="mobile-drawer mobile-drawer--left">
          <div className="drawer-header">
            <span
              style={{
                fontFamily: "var(--font-cohere)",
                fontWeight: 800,
                fontSize: "1.4rem",
              }}
            >
              bites.
            </span>
            <button
              onClick={() => setMenuOpen(false)}
              className="drawer-close-button"
            >
              <X size={20} />
            </button>
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "20px",
              marginTop: "20px",
            }}
          >
            {userEmail ? (
              <>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    borderBottom: "1px solid var(--glass-border)",
                    paddingBottom: "16px",
                  }}
                >
                  <User size={18} />
                  <span style={{ fontWeight: 600, fontSize: "0.95rem" }}>
                    {userEmail}
                  </span>
                </div>
                <Link
                  to="/orders"
                  onClick={() => setMenuOpen(false)}
                  style={{
                    textDecoration: "none",
                    color: "var(--text-slate)",
                    fontWeight: 600,
                  }}
                >
                  My Orders
                </Link>
                <Link
                  to="/addresses"
                  onClick={() => setMenuOpen(false)}
                  style={{
                    textDecoration: "none",
                    color: "var(--text-slate)",
                    fontWeight: 600,
                  }}
                >
                  Addresses
                </Link>
                <button
                  onClick={() => {
                    onLogout?.();
                    setMenuOpen(false);
                  }}
                  style={{
                    background: "none",
                    border: "none",
                    color: "var(--accent-orange)",
                    textAlign: "left",
                    fontWeight: 600,
                    padding: 0,
                    cursor: "pointer",
                  }}
                >
                  Sign Out
                </button>
              </>
            ) : (
              <Link
                to="/login"
                onClick={() => setMenuOpen(false)}
                className="btn-premium"
                style={{ textDecoration: "none", textAlign: "center" }}
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      )}
    </>
  );
};
