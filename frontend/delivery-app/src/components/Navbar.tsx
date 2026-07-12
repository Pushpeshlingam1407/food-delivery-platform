import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { Menu, X, LogOut, Truck } from "lucide-react";

interface NavbarProps {
  driverName?: string | null;
  onLogout?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  driverName = "Logistics Portal",
  onLogout,
}) => {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = React.useState(false);

  React.useEffect(() => {
    setMenuOpen(false);
  }, []);

  return (
    <>
      <nav className="navbar-container premium-navbar">
        <div className="navbar-left">
          <button
            onClick={() => setMenuOpen((open) => !open)}
            className="mobile-menu-toggle navbar-mobile-only"
            type="button"
            aria-label="Open delivery menu"
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "var(--text-slate)",
              padding: 0,
              display: "flex",
              alignItems: "center",
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
            bites
          </Link>

          <span
            className="navbar-desktop-only"
            style={{
              fontSize: "0.85rem",
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "1px",
              color: "var(--accent-violet)",
              borderLeft: "1px solid var(--glass-border)",
              paddingLeft: "16px",
            }}
          >
            {driverName || "Logistics Partner"}
          </span>
        </div>

        <div className="navbar-center navbar-mobile-only" style={{ justifyContent: "center" }}>
          <div
            style={{
              fontSize: "0.82rem",
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "1px",
              color: "var(--accent-orange)",
            }}
          >
            Driver Console
          </div>
        </div>

        <div
          className="navbar-action-group navbar-desktop-only"
          style={{ alignItems: "center", gap: "24px" }}
        >
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
                fontWeight: 700,
                fontSize: "0.95rem",
                cursor: "pointer",
              }}
            >
              <LogOut size={16} />
              Sign Out
            </button>
          )}
        </div>

        <div className="navbar-right navbar-mobile-only">
          {onLogout && (
            <button
              onClick={onLogout}
              className="navbar-signin-pill"
              type="button"
              style={{ border: "none" }}
            >
              Sign Out
            </button>
          )}
        </div>
      </nav>

      {menuOpen && (
        <button
          type="button"
          aria-label="Close driver navigation drawer"
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
              bites
            </span>
            <button
              onClick={() => setMenuOpen(false)}
              className="drawer-close-button"
              type="button"
              aria-label="Close menu"
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
              <Truck size={18} />
              <span style={{ fontWeight: 600, fontSize: "0.95rem" }}>
                {driverName || "Logistics Partner"}
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
              Active Deliveries
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
                type="button"
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