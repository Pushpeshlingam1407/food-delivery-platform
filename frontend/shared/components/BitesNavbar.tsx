import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  ChevronDown,
  LogOut,
  MapPin,
  Menu,
  ShoppingBag,
  Truck,
  User,
  Shield,
  Store,
} from "lucide-react";
import { SearchBar } from "./SearchBar";
import { PlatformNavbar } from "./PlatformNavbar";

type CustomerProps = {
  variant: "customer";
  cartCount?: number;
  userEmail?: string | null;
  onLogout?: () => void;
  onCartClick?: () => void;
  searchQuery?: string;
  onSearchChange?: (value: string) => void;
  deliveryAddress?: string;
};
type DriverProps = {
  variant: "driver";
  driverName?: string | null;
  onLogout?: () => void;
  onOpenMenu?: () => void;
};
type AdminProps = {
  variant: "admin";
  userName?: string | null;
  onLogout?: () => void;
};
type RestaurantProps = {
  variant: "restaurant";
  userName?: string | null;
  onLogout?: () => void;
};

export const BitesNavbar: React.FC<
  CustomerProps | DriverProps | AdminProps | RestaurantProps
> = (props) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [profileOpen, setProfileOpen] = React.useState(false);
  React.useEffect(() => setProfileOpen(false), [location.pathname]);

  if (props.variant === "admin" || props.variant === "restaurant") {
    const name =
      props.userName || (props.variant === "admin" ? "Admin" : "Merchant");
    return (
      <PlatformNavbar
        className="premium-navbar"
        left={
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <button
              onClick={() =>
                window.dispatchEvent(new CustomEvent("open-app-sidebar"))
              }
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: "4px",
                display: "flex",
                alignItems: "center",
                color: "var(--text-slate)",
              }}
              className="navbar-mobile-only"
            >
              <Menu size={24} />
            </button>
            <Link
              to="/"
              style={{
                fontSize: "1.5rem",
                fontWeight: 800,
                color: "var(--accent-orange)",
                textDecoration: "none",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              bites
            </Link>
          </div>
        }
        center={
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              background: "rgba(0,0,0,0.03)",
              padding: "6px 16px",
              borderRadius: "99px",
              fontSize: "0.85rem",
              fontWeight: 600,
              color: "var(--text-slate)",
            }}
          >
            {props.variant === "admin" ? (
              <Shield size={16} color="var(--accent-orange)" />
            ) : (
              <Store size={16} color="var(--accent-orange)" />
            )}
            <span>
              {props.variant === "admin"
                ? "System Administrator"
                : "Merchant Portal"}
            </span>
          </div>
        }
        right={
          props.onLogout ? (
            <div
              className="navbar-profile-menu-wrapper"
              style={{ display: "flex", alignItems: "center", gap: "16px" }}
            >
              <div
                style={{ display: "flex", alignItems: "center", gap: "10px" }}
              >
                <div
                  style={{
                    width: "36px",
                    height: "36px",
                    borderRadius: "50%",
                    background: "var(--accent-orange)",
                    color: "white",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: 700,
                  }}
                >
                  {name.charAt(0).toUpperCase()}
                </div>
                <span
                  className="navbar-desktop-only"
                  style={{ fontWeight: 600, fontSize: "0.9rem" }}
                >
                  {name}
                </span>
              </div>
              <button
                type="button"
                onClick={props.onLogout}
                style={{
                  background: "none",
                  border: "1px solid var(--glass-border)",
                  padding: "8px 16px",
                  borderRadius: "99px",
                  fontSize: "0.85rem",
                  fontWeight: 600,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  color: "var(--text-slate)",
                }}
              >
                <LogOut size={16} />
                <span className="navbar-desktop-only">Sign out</span>
              </button>
            </div>
          ) : (
            <span />
          )
        }
      />
    );
  }

  if (props.variant === "driver") {
    const name = props.driverName || "Driver";
    return (
      <PlatformNavbar
        className="delivery-navbar"
        left={
          <>
            <button
              type="button"
              className="delivery-navbar__menu navbar-mobile-only"
              aria-label="Open navigation"
              onClick={() =>
                window.dispatchEvent(new CustomEvent("open-app-sidebar"))
              }
            >
              <Menu size={20} />
            </button>
            <Link to="/" className="delivery-navbar__brand">
              bites
            </Link>
          </>
        }
        center={
          <div className="delivery-navbar__context">
            <Truck size={16} />
            <span>Driver workspace</span>
          </div>
        }
        right={
          props.onLogout ? (
            <button
              type="button"
              className="delivery-navbar__profile"
              onClick={props.onLogout}
            >
              <span>{name.charAt(0).toUpperCase()}</span>
              <span className="navbar-desktop-only">Sign out</span>
              <LogOut size={16} className="navbar-mobile-only" />
            </button>
          ) : (
            <span />
          )
        }
      />
    );
  }

  const {
    cartCount = 0,
    userEmail = null,
    onLogout,
    onCartClick,
    searchQuery = "",
    onSearchChange,
    deliveryAddress = "Bengaluru, IND",
  } = props;
  const toggleProfile = () => {
    if (window.innerWidth <= 1024) {
      navigate(userEmail ? "/profile" : "/login");
      return;
    }
    setProfileOpen((open) => !open);
  };
  return (
    <PlatformNavbar
      left={
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <button
            onClick={() =>
              window.dispatchEvent(new CustomEvent("open-app-sidebar"))
            }
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: "4px",
              display: "flex",
              alignItems: "center",
              color: "var(--text-slate)",
            }}
            className="navbar-mobile-only"
          >
            <Menu size={24} />
          </button>
          <Link to="/addresses" className="address-pill-btn">
            <div className="address-icon-wrapper">
              <MapPin size={14} color="var(--accent-orange)" />
            </div>
            <div className="address-text-wrapper">
              <span className="address-label">Deliver to</span>
              <span className="address-value">
                {deliveryAddress.length > 20
                  ? `${deliveryAddress.slice(0, 20)}...`
                  : deliveryAddress}
              </span>
            </div>
            <ChevronDown
              size={16}
              color="var(--text-muted)"
              className="address-chevron"
            />
          </Link>
        </div>
      }
      center={
        location.pathname === "/" ? (
          <SearchBar
            placeholder="Search restaurants or dishes"
            value={searchQuery}
            onSearchChange={onSearchChange}
            className="navbar-search-box"
          />
        ) : null
      }
      right={
        <>
          {!userEmail ? (
            <Link to="/login" className="navbar-signin-pill">
              Sign In
            </Link>
          ) : (
            <div className="navbar-profile-menu-wrapper">
              <button
                type="button"
                onClick={toggleProfile}
                className={`navbar-profile-btn ${profileOpen ? "navbar-profile-btn--active" : ""}`}
                aria-label="Open profile menu"
              >
                <User size={20} />
              </button>
              {profileOpen && window.innerWidth > 1024 && (
                <div className="navbar-profile-menu">
                  <div className="navbar-profile-menu-header">
                    <span className="navbar-profile-menu-eyebrow">
                      Logged in as
                    </span>
                    <div className="navbar-profile-menu-email">{userEmail}</div>
                  </div>
                  <Link
                    to="/orders"
                    onClick={() => setProfileOpen(false)}
                    className="navbar-profile-menu-link"
                  >
                    My Orders
                  </Link>
                  <Link
                    to="/addresses"
                    onClick={() => setProfileOpen(false)}
                    className="navbar-profile-menu-link"
                  >
                    Addresses
                  </Link>
                  {onLogout && (
                    <button
                      onClick={onLogout}
                      className="navbar-profile-menu-signout"
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
            className={`cart-btn-capsule ${cartCount > 0 ? "cart-btn-capsule--active" : ""}`}
          >
            <ShoppingBag size={18} />
            <span className="cart-text">
              {cartCount > 0 ? `${cartCount} Items` : "Cart"}
            </span>
          </button>
        </>
      }
    />
  );
};
