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

  return (
    <>
      <nav className="navbar-container">
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

        {/* Address Selector (Apple-style pill) */}
        <div
          className="navbar-desktop-only"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            background: "rgba(25, 25, 25, 0.04)",
            padding: "8px 16px",
            borderRadius: "100px",
            fontSize: "0.9rem",
            fontWeight: 500,
            cursor: "pointer",
            border: "1px solid transparent",
            transition: "all 0.2s ease",
          }}
          onMouseEnter={(e) =>
            (e.currentTarget.style.border = "1px solid var(--glass-border)")
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.border = "1px solid transparent")
          }
        >
          <MapPin size={16} color="var(--accent-orange)" />
          <span style={{ color: "var(--text-slate)" }}>Deliver to:</span>
          <strong style={{ fontWeight: 600 }}>Bengaluru, IND</strong>
        </div>

        {/* Search Input Bar */}
        <div
          className="navbar-desktop-only"
          style={{
            display: "flex",
            alignItems: "center",
            background: "#FFF",
            border: "1px solid var(--glass-border)",
            borderRadius: "var(--radius-standard)",
            padding: "8px 16px",
            width: "320px",
            gap: "8px",
          }}
        >
          <Search size={16} color="var(--text-muted)" />
          <input
            type="text"
            placeholder="Search restaurants, cuisines..."
            value={searchQuery}
            onChange={(e) => onSearchChange && onSearchChange(e.target.value)}
            style={{
              border: "none",
              outline: "none",
              width: "100%",
              fontFamily: "var(--font-apple)",
              fontSize: "0.9rem",
            }}
          />
        </div>

        {/* Action items */}
        <div style={{ display: "flex", alignItems: "center", gap: "24px" }}>
          {walletBalance !== null && (
            <div
              onClick={onDepositClick}
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
              title="Deposit Money"
            >
              <Wallet size={16} />
              <span>${walletBalance.toFixed(2)}</span>
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
      </nav>

      {/* Mobile Drawer (3-lines Sidebar) */}
      {menuOpen && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "280px",
            height: "100vh",
            background: "#FFF",
            boxShadow: "var(--glass-shadow)",
            zIndex: 1000,
            padding: "32px",
            display: "flex",
            flexDirection: "column",
            gap: "24px",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
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
              style={{ background: "none", border: "none", cursor: "pointer" }}
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
