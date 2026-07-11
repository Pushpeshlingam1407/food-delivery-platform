import React from "react";
import { Link, useLocation } from "react-router-dom";
import { ShoppingBag, MapPin, ChevronDown, User } from "lucide-react";
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
  deliveryAddress?: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  cartCount = 0,
  userEmail = null,
  onCartClick,
  searchQuery = "",
  onSearchChange,
  deliveryAddress = "Bengaluru, IND",
}) => {
  const location = useLocation();
  const isHomePage = location.pathname === "/";

  return (
    <>
      <nav className="navbar-container premium-navbar">
        {/* Left Side: Address Context */}
        <div className="navbar-left">
          <Link
            to="/addresses"
            className="address-pill-btn"
            onMouseOver={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.9)")}
            onMouseOut={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.5)")}
          >
            <div className="address-icon-wrapper">
              <MapPin size={14} color="var(--accent-orange)" />
            </div>
            <div className="address-text-wrapper">
              <span className="address-label">Deliver to</span>
              <span className="address-value">
                {deliveryAddress.length > 20 ? deliveryAddress.substring(0, 20) + "..." : deliveryAddress}
              </span>
            </div>
            <ChevronDown size={16} color="var(--text-muted)" style={{ marginLeft: "4px" }} />
          </Link>
        </div>

        {/* Center: Search */}
        <div className="navbar-center">
          {isHomePage && (
            <SearchBar
              placeholder="Search premium restaurants, dishes..."
              value={searchQuery}
              onSearchChange={onSearchChange}
              containerStyle={{ width: "100%", boxShadow: "0 2px 12px rgba(0,0,0,0.03)" }}
            />
          )}
        </div>

        {/* Right Side: Cart & Profile */}
        <div className="navbar-right">
          {!userEmail ? (
            <Link
              to="/login"
              style={{
                padding: "10px 20px",
                fontSize: "0.9rem",
                fontWeight: 700,
                color: "var(--accent-orange)",
                textDecoration: "none",
                borderRadius: "99px",
                background: "#fff0ec",
                transition: "all 0.2s ease",
              }}
            >
              Sign In
            </Link>
          ) : (
            <button
              onClick={() => window.dispatchEvent(new Event("open-app-sidebar"))}
              className="navbar-profile-btn"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: "40px",
                height: "40px",
                borderRadius: "50%",
                background: "rgba(255,255,255,0.7)",
                border: "1px solid var(--glass-border)",
                color: "var(--text-slate)",
                cursor: "pointer",
                transition: "all 0.2s ease",
              }}
            >
              <User size={20} />
            </button>
          )}

          <button
            onClick={onCartClick}
            className="cart-btn-capsule"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              background: cartCount > 0 ? "var(--accent-orange)" : "rgba(255,255,255,0.7)",
              color: cartCount > 0 ? "#ffffff" : "var(--text-slate)",
              border: cartCount > 0 ? "none" : "1px solid var(--glass-border)",
              padding: "10px 20px",
              borderRadius: "99px",
              fontWeight: 700,
              fontSize: "0.9rem",
              cursor: "pointer",
              transition: "all 0.2s ease",
              boxShadow: cartCount > 0 ? "0 4px 12px rgba(255, 63, 26, 0.2)" : "none",
            }}
            onMouseOver={(e) => {
              if (cartCount === 0) e.currentTarget.style.background = "rgba(255,255,255,1)";
            }}
            onMouseOut={(e) => {
              if (cartCount === 0) e.currentTarget.style.background = "rgba(255,255,255,0.7)";
            }}
          >
            <ShoppingBag size={18} />
            <span className="cart-text">{cartCount > 0 ? `${cartCount} Items` : "Cart"}</span>
          </button>
        </div>
      </nav>

      {/* Mobile Address Pill (Fallback for mobile screens where the top address bar might get squished) */}
      <div className="mobile-only" style={{ padding: "12px 16px", background: "var(--glass-bg)", display: "none" }}>
        <Link
          to="/addresses"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            textDecoration: "none",
            color: "var(--text-slate)",
            fontSize: "0.85rem",
            fontWeight: 600,
          }}
        >
          <MapPin size={16} color="var(--accent-orange)" />
          Deliver to: <span style={{ color: "var(--accent-orange)" }}>{deliveryAddress}</span>
        </Link>
      </div>
    </>
  );
};
