import React from "react";
import { Link } from "react-router-dom";
import { LogOut, Shield } from "lucide-react";

interface NavbarProps {
  adminName?: string | null;
  onLogout?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ adminName = "System Admin", onLogout }) => {
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
      <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
        <div
          style={{
            fontFamily: "var(--font-cohere)",
            fontWeight: 800,
            fontSize: "1.6rem",
            background: "var(--primary-gradient)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          bites.
        </div>
        <span
          style={{
            fontSize: "0.85rem",
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "1px",
            color: "var(--accent-orange)",
            borderLeft: "1px solid var(--glass-border)",
            paddingLeft: "16px",
            display: "flex",
            alignItems: "center",
            gap: "6px",
          }}
        >
          <Shield size={14} /> {adminName || "Console"}
        </span>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: "32px" }}>
        <Link to="/" style={{ textDecoration: "none", color: "var(--text-slate)", fontWeight: 600, fontSize: "0.95rem", fontFamily: "var(--font-cohere)" }}>
          Console
        </Link>
        <Link to="/refunds" style={{ textDecoration: "none", color: "var(--text-slate)", fontWeight: 600, fontSize: "0.95rem", fontFamily: "var(--font-cohere)" }}>
          Refunds Control
        </Link>
        <Link to="/settings" style={{ textDecoration: "none", color: "var(--text-slate)", fontWeight: 600, fontSize: "0.95rem", fontFamily: "var(--font-cohere)" }}>
          System Configuration
        </Link>
        <Link to="/cms" style={{ textDecoration: "none", color: "var(--text-slate)", fontWeight: 600, fontSize: "0.95rem", fontFamily: "var(--font-cohere)" }}>
          CMS Pages
        </Link>

        {onLogout && (
          <button
            onClick={onLogout}
            style={{
              background: "transparent",
              border: "none",
              color: "var(--text-slate)",
              display: "flex",
              alignItems: "center",
              gap: "6px",
              fontWeight: 600,
              fontSize: "0.95rem",
              cursor: "pointer",
            }}
          >
            <LogOut size={16} />
            Sign Out
          </button>
        )}
      </div>
    </nav>
  );
};
