import React from "react";
import { Link, useLocation } from "react-router-dom";
import { ShoppingBag, MapPin, ChevronDown } from "lucide-react";
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
      <nav
        className="navbar-container"
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          width: "100%",
          padding: "16px 32px",
          background: "var(--glass-bg)",
          backdropFilter: "var(--glass-blur)",
          WebkitBackdropFilter: "var(--glass-blur)",
          borderBottom: "1px solid var(--glass-border)",
          position: "sticky",
          top: 0,
          zIndex: 90,
          boxShadow: "0 4px 24px rgba(0,0,0,0.02)",
        }}
      >
        {/* Left Side: Address Context */}
        <div style={{ display: "flex", alignItems: "center", minWidth: "200px" }}>
          <Link
            to="/addresses"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              textDecoration: "none",
              background: "rgba(255,255,255,0.5)",
              padding: "10px 16px",
              borderRadius: "99px",
              border: "1px solid var(--glass-border)",
              transition: "all 0.2s ease",
            }}
            onMouseOver={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.9)")}
            onMouseOut={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.5)")}
          >
            <div
              style={{
                background: "#fff0ec",
                padding: "6px",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <MapPin size={14} color="var(--accent-orange)" />
            </div>
            <div style={{ display: "flex", flexDirection: "column", justifyContent: "center" }}>
              <span style={{ fontSize: "0.7rem", color: "var(--text-muted)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.5px", lineHeight: "1" }}>
                Deliver to
              </span>
              <span style={{ fontSize: "0.9rem", color: "var(--text-slate)", fontWeight: 700, lineHeight: "1.2", marginTop: "2px" }}>
                {deliveryAddress.length > 20 ? deliveryAddress.substring(0, 20) + "..." : deliveryAddress}
              </span>
            </div>
            <ChevronDown size={16} color="var(--text-muted)" style={{ marginLeft: "4px" }} />
          </Link>
        </div>

        {/* Center: Search */}
        <div style={{ flex: 1, display: "flex", justifyContent: "center", maxWidth: "600px", margin: "0 24px" }}>
          {isHomePage && (
            <SearchBar
              placeholder="Search premium restaurants, dishes..."
              value={searchQuery}
              onSearchChange={onSearchChange}
              containerStyle={{ width: "100%", boxShadow: "0 2px 12px rgba(0,0,0,0.03)" }}
            />
          )}
        </div>

        {/* Right Side: Cart */}
        <div style={{ display: "flex", alignItems: "center", gap: "16px", minWidth: "200px", justifyContent: "flex-end" }}>
          {!userEmail && (
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
          )}

          <button
            onClick={onCartClick}
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
            <span>{cartCount > 0 ? `${cartCount} Items` : "Cart"}</span>
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
