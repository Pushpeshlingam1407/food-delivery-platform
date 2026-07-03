import React from "react";
import { Link } from "react-router-dom";
import { ShoppingBag, User, Search, MapPin } from "lucide-react";

interface NavbarProps {
  cartCount?: number;
  userEmail?: string | null;
  onLogout?: () => void;
  onCartClick?: () => void;
  searchQuery?: string;
  onSearchChange?: (val: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  cartCount = 0,
  userEmail = null,
  onLogout,
  onCartClick,
  searchQuery = "",
  onSearchChange,
}) => {
  return (
    <nav
      style={{
        position: "sticky",
        top: 0,
        zIndex: 100,
        background: "var(--glass-bg)",
        borderBottom: "1px solid var(--glass-border)",
        backdropFilter: "var(--glass-blur)",
        padding: "16px 40px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        boxShadow: "var(--glass-shadow)",
      }}
    >
      {/* Brand logo (Cohere style) */}
      <div
        style={{
          fontFamily: "var(--font-cohere)",
          fontWeight: 800,
          fontSize: "1.6rem",
          background: "var(--primary-gradient)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          cursor: "pointer",
        }}
      >
        bites.
      </div>

      {/* Address Selector (Apple-style pill) */}
      <div
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
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
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
        )}
      </div>
    </nav>
  );
};
