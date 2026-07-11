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
  const [profileDropdownOpen, setProfileDropdownOpen] = React.useState(false);

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
            <div style={{ position: "relative" }}>
              <button
                onClick={() => {
                  if (window.innerWidth <= 1024) {
                    window.dispatchEvent(new Event("open-app-sidebar"));
                  } else {
                    setProfileDropdownOpen(!profileDropdownOpen);
                  }
                }}
                className="navbar-profile-btn"
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: "40px",
                  height: "40px",
                  borderRadius: "50%",
                  background: profileDropdownOpen ? "var(--glass-border)" : "rgba(255,255,255,0.7)",
                  border: "1px solid var(--glass-border)",
                  color: "var(--text-slate)",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                }}
              >
                <User size={20} />
              </button>

              {profileDropdownOpen && window.innerWidth > 1024 && (
                <div
                  style={{
                    position: "absolute",
                    top: "50px",
                    right: 0,
                    width: "220px",
                    background: "var(--glass-bg)",
                    border: "1px solid var(--glass-border)",
                    borderRadius: "16px",
                    boxShadow: "0 8px 32px rgba(0,0,0,0.08)",
                    backdropFilter: "var(--glass-blur)",
                    WebkitBackdropFilter: "var(--glass-blur)",
                    display: "flex",
                    flexDirection: "column",
                    overflow: "hidden",
                    zIndex: 100,
                  }}
                >
                  <div style={{ padding: "16px", borderBottom: "1px solid var(--glass-border)" }}>
                    <span style={{ fontSize: "0.85rem", color: "var(--text-muted)", fontWeight: 600 }}>Logged in as</span>
                    <div style={{ fontSize: "0.95rem", fontWeight: 700, color: "var(--text-slate)", marginTop: "4px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {userEmail}
                    </div>
                  </div>
                  <Link to="/orders" style={{ padding: "12px 16px", textDecoration: "none", color: "var(--text-slate)", fontWeight: 600, fontSize: "0.9rem", transition: "background 0.2s" }} onMouseOver={(e) => (e.currentTarget.style.background = "rgba(0,0,0,0.03)")} onMouseOut={(e) => (e.currentTarget.style.background = "transparent")}>
                    My Orders
                  </Link>
                  <Link to="/addresses" style={{ padding: "12px 16px", textDecoration: "none", color: "var(--text-slate)", fontWeight: 600, fontSize: "0.9rem", transition: "background 0.2s" }} onMouseOver={(e) => (e.currentTarget.style.background = "rgba(0,0,0,0.03)")} onMouseOut={(e) => (e.currentTarget.style.background = "transparent")}>
                    Addresses
                  </Link>
                  {onLogout && (
                    <button
                      onClick={onLogout}
                      style={{ padding: "12px 16px", background: "none", border: "none", borderTop: "1px solid var(--glass-border)", textAlign: "left", color: "var(--accent-orange)", fontWeight: 700, fontSize: "0.9rem", cursor: "pointer", transition: "background 0.2s" }}
                      onMouseOver={(e) => (e.currentTarget.style.background = "rgba(255, 63, 26, 0.05)")}
                      onMouseOut={(e) => (e.currentTarget.style.background = "transparent")}
                    >
                      Sign Out
                    </button>
                  )}
                </div>
              )}
            </div>
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
