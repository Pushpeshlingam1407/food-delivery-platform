import React, { useState } from "react";
import { Link } from "react-router-dom";
import { LogOut, Shield, Menu, X, User } from "lucide-react";

interface NavbarProps {
  adminName?: string | null;
  onLogout?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  adminName = "System Admin",
  onLogout,
}) => {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      <nav className="navbar-container">
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          {/* Hamburger toggle */}
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

          <Link
            to="/"
            style={{
              fontFamily: "var(--font-cohere)",
              fontWeight: 800,
              fontSize: "1.6rem",
              background: "var(--primary-gradient)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              textDecoration: "none",
              cursor: "pointer",
            }}
          >
            bites.
          </Link>
          <span
            className="navbar-desktop-only"
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

        <div
          className="navbar-desktop-only"
          style={{ alignItems: "center", gap: "32px" }}
        >
          <Link
            to="/"
            style={{
              textDecoration: "none",
              color: "var(--text-slate)",
              fontWeight: 600,
              fontSize: "0.95rem",
              fontFamily: "var(--font-cohere)",
            }}
          >
            Console
          </Link>
          <Link
            to="/refunds"
            style={{
              textDecoration: "none",
              color: "var(--text-slate)",
              fontWeight: 600,
              fontSize: "0.95rem",
              fontFamily: "var(--font-cohere)",
            }}
          >
            Refunds Control
          </Link>
          <Link
            to="/settings"
            style={{
              textDecoration: "none",
              color: "var(--text-slate)",
              fontWeight: 600,
              fontSize: "0.95rem",
              fontFamily: "var(--font-cohere)",
            }}
          >
            System Configuration
          </Link>
          <Link
            to="/cms"
            style={{
              textDecoration: "none",
              color: "var(--text-slate)",
              fontWeight: 600,
              fontSize: "0.95rem",
              fontFamily: "var(--font-cohere)",
            }}
          >
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
                {adminName || "System Admin"}
              </span>
            </div>
            <Link
              to="/"
              onClick={() => setMenuOpen(false)}
              style={{
                textDecoration: "none",
                color: "var(--text-slate)",
                fontWeight: 600,
              }}
            >
              Console Dashboard
            </Link>
            <Link
              to="/refunds"
              onClick={() => setMenuOpen(false)}
              style={{
                textDecoration: "none",
                color: "var(--text-slate)",
                fontWeight: 600,
              }}
            >
              Refunds Control
            </Link>
            <Link
              to="/settings"
              onClick={() => setMenuOpen(false)}
              style={{
                textDecoration: "none",
                color: "var(--text-slate)",
                fontWeight: 600,
              }}
            >
              System Configuration
            </Link>
            <Link
              to="/cms"
              onClick={() => setMenuOpen(false)}
              style={{
                textDecoration: "none",
                color: "var(--text-slate)",
                fontWeight: 600,
              }}
            >
              CMS Pages
            </Link>
            {onLogout && (
              <button
                onClick={() => {
                  onLogout();
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
            )}
          </div>
        </div>
      )}
    </>
  );
};
